import FeatherIcon from 'feather-icons-react'
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
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { isAddress } from 'ethers/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { DELEGATION_LEARN_MORE_URL } from './constants'
import { ErrorMessage } from './DelegationForm'
import { useIsUserDelegatorsRepresentative } from './hooks/useIsUserDelegatorsRepresentative'
import { getTwabDelegatorContract } from './utils/getTwabDelegatorContract'
import { useSigner } from 'wagmi'

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
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  return (
    <>
      <ModalTitle chainId={chainId} title={t('manageRepresentatives', 'Manage representatives')} />
      <p className='mx-auto text-xs'>{t('representativeExplainer')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
      {usersAddress === delegator && (
        <div className='mx-auto space-y-2'>
          <div className='text-xs opacity-70'>{t('manageRepresentatives')}</div>
          <SquareButton onClick={() => setModalState(ModalState.add)} className='w-full'>
            {t('addARep')}
          </SquareButton>
          <SquareButton onClick={() => setModalState(ModalState.remove)} className='w-full'>
            {t('removeARep')}
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
  const { data: signer } = useSigner()
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
        <span className='ml-1 opacity-70'>{t('repAddress', 'Representative Address')}</span>
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
}> = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <ModalTitle chainId={props.chainId} title={t('addARep', 'Add a representative')} />
      <p className='mx-auto text-xs mb-12'>
        {t(
          'addRepExplainer',
          'Enter an address to add it as a representative. Representatives have access to edit your delegations while you maintain full custody of your staked funds.'
        )}
      </p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
      <SetRepresentativeView {...props} set={true} />
    </>
  )
}

const RemoveRepresentativeView: React.FC<{
  chainId: number
  delegator: string
  setIsOpen: (isOpen: boolean) => void
  setModalState: (modalState: ModalState) => void
}> = (props) => {
  const { t } = useTranslation()
  return (
    <>
      <ModalTitle chainId={props.chainId} title={t('removeARep', 'Remove a representative')} />
      <p className='mx-auto text-xs'>
        {t(
          'removeRepExplainer',
          'Enter an address to remove it from your representatives. They will no longer have access to edit your delegations once the transaction has confirmed.'
        )}
      </p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
      <SetRepresentativeView {...props} set={false} />
    </>
  )
}
