import { TxButton } from '@components/Buttons/TxButton'
import { StyledInput } from '@components/Input'
import {
  BottomSheet,
  ModalTitle,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'
import {
  useSendTransaction,
  useTransaction,
  useUsersAddress,
  useWalletSigner
} from '@pooltogether/wallet-connection'
import { isAddress } from 'ethers/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ErrorMessage } from './DelegationForm'
import { useIsUserDelegatorsRepresentative } from './hooks/useIsUserDelegatorsRepresentative'
import { getTwabDelegatorContract } from './utils/getTwabDelegatorContract'

enum ModalState {
  main = 'MAIN',
  add = 'ADD',
  remove = 'REMOVE'
}

/**
 * TODO: Add a list of the delegators current representatives.
 * Fetch the data from the graph if possible and display a list of copyable addresses.
 * Potentially also show a list of delegates who delegated to the connect wallet somewhere else so they can easily switch the delegator and manage delegations.
 *
 * https://thegraph.com/hosted-service/subgraph/pooltogether/
 * https://thegraph.com/hosted-service/dashboard?account=pooltogether
 * https://thegraph.com/hosted-service/subgraph/pooltogether/avalanche-twab-delegator
 * https://thegraph.com/hosted-service/subgraph/pooltogether/mainnet-twab-delegator
 * https://thegraph.com/hosted-service/subgraph/pooltogether/polygon-twab-delegator
 *
 *
 * @param props
 * @returns
 */
export const ManageRepresentativeModal: React.FC<{
  chainId: number
  isOpen: boolean
  delegator: string
  setIsOpen: (isOpen: boolean) => void
}> = (props) => {
  const { chainId, delegator, isOpen, setIsOpen } = props

  const [modalState, setModalState] = useState<ModalState>(ModalState.main)
  const { t } = useTranslation()

  let view = (
    <ManageRepresentativeHomeView
      chainId={chainId}
      delegator={delegator}
      setIsOpen={setIsOpen}
      setModalState={setModalState}
    />
  )
  if (modalState === ModalState.add) {
    view = (
      <AddRepresentativeView
        chainId={chainId}
        delegator={delegator}
        setIsOpen={setIsOpen}
        setModalState={setModalState}
      />
    )
  } else if (modalState === ModalState.remove) {
    view = (
      <RemoveRepresentativeView
        chainId={chainId}
        delegator={delegator}
        setIsOpen={setIsOpen}
        setModalState={setModalState}
      />
    )
  }

  return (
    <BottomSheet
      label='representative-management-modal'
      open={isOpen}
      onDismiss={() => setIsOpen(false)}
      className='space-y-4'
    >
      {view}
    </BottomSheet>
  )
}

const ManageRepresentativeHomeView: React.FC<{
  chainId: number
  delegator: string
  setIsOpen: (isOpen: boolean) => void
  setModalState: (modalState: ModalState) => void
}> = (props) => {
  const { delegator, setModalState, chainId } = props
  const usersAddress = useUsersAddress()
  return (
    <>
      <ModalTitle chainId={chainId} title='Manage Representatives' />
      <p className='mx-auto text-xs'>
        Representatives can manage your delegation positions while you maintain full custody of your
        funds. <a className='text-pt-teal'>Learn more.</a>
      </p>
      <p className='mx-auto text-xs'>
        Check out our user guide or a fun article on how Ledger is using delegations for their
        users.
      </p>
      {usersAddress === delegator && (
        <div className='mx-auto space-y-2'>
          <div className='text-xs opacity-70'>Manage Representatives</div>
          <SquareButton onClick={() => setModalState(ModalState.add)} className='w-full'>
            Add Representative
          </SquareButton>
          <SquareButton onClick={() => setModalState(ModalState.remove)} className='w-full'>
            Remove Representative
          </SquareButton>
        </div>
      )}
    </>
  )
}

const SetRepresentativeView: React.FC<{
  chainId: number
  set: boolean
  delegator: string
  setIsOpen: (isOpen: boolean) => void
  setModalState: (modalState: ModalState) => void
}> = (props) => {
  const { chainId, set, delegator, setModalState } = props
  const { t } = useTranslation()

  const [transactionId, setTransactionId] = useState<string>('')
  const transaction = useTransaction(transactionId)
  const {
    register,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<{ representative: string }>({
    mode: 'onTouched',
    shouldUnregister: true
  })
  const signer = useWalletSigner()
  const sendTransaction = useSendTransaction()
  const representative = watch('representative')

  const {
    data: isAddressARepresentative,
    isFetched,
    isFetching
  } = useIsUserDelegatorsRepresentative(chainId, representative, delegator)

  const onSubmit = (representative: string) => {
    const contract = getTwabDelegatorContract(chainId, signer)

    setTransactionId(
      sendTransaction({
        name: set ? 'Add Representative' : 'Remove Representative',
        callTransaction: () => contract.setRepresentative(representative, set),
        callbacks: {
          onConfirmedByUser: () => reset()
        }
      })
    )
  }
  return (
    <>
      <form autoComplete='off' className='flex flex-col'>
        <span className='ml-1 opacity-70'>Representative Address</span>
        <StyledInput
          id='representative'
          invalid={!!errors.representative}
          className='w-full'
          placeholder='0xabc...'
          {...register('representative', {
            required: {
              value: true,
              message: 'Representative required'
            },
            validate: {
              isAddress: (v) => isAddress(v) || (t('invalidAddress') as string)
            }
          })}
        />
        <ErrorMessage className=''>
          {errors.representative?.message || (
            <>
              {!!representative &&
                !isAddressARepresentative &&
                !set &&
                'Address is not a representative'}
              {!!representative &&
                isAddressARepresentative &&
                set &&
                'Address is already a representative'}
            </>
          )}
        </ErrorMessage>
        <TxButton
          type='button'
          chainId={chainId}
          state={transaction?.state}
          status={transaction?.status}
          className='w-full capitalize mb-3'
          disabled={
            !isValid ||
            isFetching ||
            !isFetched ||
            (!isAddressARepresentative && !set) ||
            (isAddressARepresentative && set)
          }
          onClick={() => onSubmit(representative)}
        >
          {set ? 'Add representative' : 'Remove representative'}
        </TxButton>
        <SquareButton
          theme={SquareButtonTheme.tealOutline}
          onClick={() => setModalState(ModalState.main)}
        >
          Back
        </SquareButton>
      </form>
    </>
  )
}

const AddRepresentativeView: React.FC<{
  chainId: number
  delegator: string
  setIsOpen: (isOpen: boolean) => void
  setModalState: (modalState: ModalState) => void
}> = (props) => (
  <>
    <ModalTitle chainId={props.chainId} title='Add a representative' />
    <p className='mx-auto text-xs'>
      Enter an address to set it as a representative for your delegations.
    </p>
    <p className='mx-auto text-xs mb-12'>
      Representatives can manage your delegation positions while you maintain full custody of your
      funds. <a className='text-pt-teal'>Learn more.</a>
    </p>
    <SetRepresentativeView {...props} set={true} />
  </>
)

const RemoveRepresentativeView: React.FC<{
  chainId: number
  delegator: string
  setIsOpen: (isOpen: boolean) => void
  setModalState: (modalState: ModalState) => void
}> = (props) => (
  <>
    <ModalTitle chainId={props.chainId} title='Remove a representative' />
    <p className='mx-auto text-xs'>Enter an address to remove it from your representatives.</p>
    <p className='mx-auto text-xs mb-12'>
      Representatives can manage your delegation positions while you maintain full custody of your
      funds. <a className='text-pt-teal'>Learn more.</a>
    </p>
    <SetRepresentativeView {...props} set={false} />
  </>
)
