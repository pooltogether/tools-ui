import { TxButton } from '@components/Buttons/TxButton'
import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { Token, useTokenAllowance } from '@pooltogether/hooks'
import { BottomSheet, ModalTitle, Button, ButtonTheme } from '@pooltogether/react-components'
import {
  useSendTransaction,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { DELEGATION_LEARN_MORE_URL } from '@twabDelegator/constants'
import { useDelegatorsStake } from '@twabDelegator/hooks/useDelegatorsStake'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'
import { getV4TicketContract } from '@utils/getV4TicketContract'
import { signERC2612Permit } from 'eth-permit'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useSigner } from 'wagmi'

enum ModalState {
  main = 'MAIN',
  add = 'ADD',
  remove = 'REMOVE'
}

export const StakeModal: React.FC<{
  chainId: number
  delegator: string
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, chainId, delegator, closeModal } = props
  const ticket = useV4Ticket(chainId)
  const { t } = useTranslation()
  const [modalState, setModalState] = useState<ModalState>(ModalState.main)

  let view = <ManageStakeHomeView chainId={chainId} ticket={ticket} setModalState={setModalState} />
  if (modalState === ModalState.add) {
    view = (
      <AddStakeView
        chainId={chainId}
        delegator={delegator}
        setModalState={setModalState}
        ticket={ticket}
      />
    )
  } else if (modalState === ModalState.remove) {
    view = (
      <RemoveStakeView
        chainId={chainId}
        delegator={delegator}
        setModalState={setModalState}
        ticket={ticket}
      />
    )
  }

  return (
    <BottomSheet
      label={`Stake ${ticket.symbol} on deposit delegator modal`}
      isOpen={isOpen}
      closeModal={closeModal}
    >
      {view}
    </BottomSheet>
  )
}

const ManageStakeHomeView: React.FC<{
  chainId: number
  setModalState: (modalState: ModalState) => void
  ticket: Token
}> = (props) => {
  const { chainId, setModalState, ticket } = props
  const { t } = useTranslation()
  return (
    <>
      <ModalTitle chainId={chainId} title={t('stakeToken', { token: ticket.symbol })} />
      <p className='mb-2'>{t('depositTokenForFutureDelegations', { token: ticket.symbol })}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1 mb-6'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
      <div className='mx-auto space-y-2'>
        <div className='text-xs opacity-70'>Manage Stake</div>
        <Button onClick={() => setModalState(ModalState.add)} className='w-full'>
          {t('stakeToken', { token: ticket.symbol })}
        </Button>
        <Button onClick={() => setModalState(ModalState.remove)} className='w-full'>
          {t('unstakeToken', { token: ticket.symbol })}
        </Button>
      </div>
    </>
  )
}

const AddStakeView: React.FC<{
  chainId: number
  delegator: string
  ticket: Token
  setModalState: (modalState: ModalState) => void
}> = (props) => {
  const { chainId, delegator, ticket, setModalState } = props
  const { t } = useTranslation()
  return (
    <>
      <ModalTitle chainId={chainId} title={t('stakeToken', { token: ticket.symbol })} />
      <p className='mb-2'>{t('depositTokenForFutureDelegations', { token: ticket.symbol })}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1 mb-6'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
      <AddStakeForm chainId={chainId} delegator={delegator} ticket={ticket} />
      <Button
        className='w-full'
        theme={ButtonTheme.tealOutline}
        onClick={() => setModalState(ModalState.main)}
      >
        {t('back')}
      </Button>
    </>
  )
}

const RemoveStakeView: React.FC<{
  chainId: number
  delegator: string
  ticket: Token
  setModalState: (modalState: ModalState) => void
}> = (props) => {
  const { chainId, delegator, ticket, setModalState } = props
  const { t } = useTranslation()
  return (
    <>
      <ModalTitle chainId={chainId} title={t('unstakeToken', { token: ticket.symbol })} />
      <p className='mb-2'>{t('removeTokenFromDepositDelegator', { token: ticket.symbol })}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1 mb-6'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
      <RemoveStakeForm chainId={chainId} delegator={delegator} ticket={ticket} />
      <Button
        className='w-full'
        theme={ButtonTheme.tealOutline}
        onClick={() => setModalState(ModalState.main)}
      >
        {t('back')}
      </Button>
    </>
  )
}

const FORM_KEY = 'stake'

const AddStakeForm: React.FC<{
  chainId: number
  delegator: string
  ticket: Token
}> = (props) => {
  const { chainId, ticket, delegator } = props
  const { t } = useTranslation()

  const [isSignaturePending, setSignaturePending] = useState<boolean>(false)
  const usersAddress = useUsersAddress()
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowanceUnformatted, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const [transactionId, setTransactionId] = useState<string>('')
  const transaction = useTransaction(transactionId)
  const {
    register,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<{ [FORM_KEY]: string }>({
    mode: 'onTouched',
    shouldUnregister: true
  })
  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const amount = watch(FORM_KEY)
  const { refetch: refetchStake } = useDelegatorsStake(chainId, delegator)

  const onSubmit = async (amount: string) => {
    const amountUnformatted = parseUnits(amount, ticket.decimals)
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const ticketContract = getV4TicketContract(chainId)

    // Default case if user has enough allowance
    let callTransaction = () => twabDelegatorContract.stake(delegator, amountUnformatted)

    // Otherwise, get signature approval
    if (allowanceUnformatted.lt(amountUnformatted)) {
      setSignaturePending(true)

      const amountToIncrease = amountUnformatted.sub(allowanceUnformatted)
      const domain = {
        name: 'PoolTogether ControlledToken',
        version: '1',
        chainId,
        verifyingContract: ticketContract.address
      }

      // NOTE: Nonce must be passed manually for signERC2612Permit to work with WalletConnect
      const deadline = (await signer.provider.getBlock('latest')).timestamp + 5 * 60
      const response = await ticketContract.functions.nonces(usersAddress)
      const nonce: BigNumber = response[0]

      const signaturePromise = signERC2612Permit(
        signer,
        domain,
        usersAddress,
        twabDelegatorContract.address,
        amountToIncrease.toString(),
        deadline,
        nonce.toNumber()
      )

      toast.promise(signaturePromise, {
        pending: t('signatureIsPending'),
        error: t('signatureRejected')
      })

      try {
        const signature = await signaturePromise

        // Overwrite v for hardware wallet signatures
        // https://ethereum.stackexchange.com/questions/103307/cannot-verifiy-a-signature-produced-by-ledger-in-solidity-using-ecrecover
        const v = signature.v < 27 ? signature.v + 27 : signature.v

        const populatedTx = await twabDelegatorContract.populateTransaction.stake(
          delegator,
          amountUnformatted
        )

        callTransaction = async () =>
          twabDelegatorContract.permitAndMulticall(
            amountToIncrease,
            {
              deadline: signature.deadline,
              v,
              r: signature.r,
              s: signature.s
            },
            [populatedTx.data]
          )
      } catch (e) {
        setSignaturePending(false)
        console.error(e)
        return
      }
    }

    setTransactionId(
      sendTransaction({
        name: t('stake'),
        callTransaction,
        callbacks: {
          onSentToWallet: () => setSignaturePending(false),
          onConfirmedByUser: () => reset(),
          onSuccess: () => refetchStake()
        }
      })
    )
  }

  return (
    <>
      <form autoComplete='off' className='flex flex-col'>
        <span className='ml-1 opacity-70'>{t('stakeAmount', 'Stake amount')}</span>
        <StyledInput
          id={FORM_KEY}
          invalid={!!errors?.[FORM_KEY]}
          className='w-full'
          placeholder='eg. 1000'
          {...register(FORM_KEY, {
            required: {
              value: true,
              message: 'Amount is required'
            },
            validate: {
              isNumber: (v) => !isNaN(Number(v)) || 'Amount must be a number',
              isValidBigNumber: (v) => {
                try {
                  parseUnits(v, ticket.decimals)
                  return true
                } catch (e) {
                  return 'Invalid amount'
                }
              },
              isPositive: (v) => Number(v) >= 0 || 'Amount must be a positive number'
            }
          })}
        />
        <ErrorMessage className=''>{errors[FORM_KEY]?.message}</ErrorMessage>

        <TxButton
          type='button'
          chainId={chainId}
          state={transaction?.state}
          status={transaction?.status}
          className='w-full capitalize mb-3'
          disabled={!isValid || !isAllowanceFetched || isSignaturePending}
          onClick={() => onSubmit(amount)}
        >
          {isSignaturePending ? t('signatureIsPending') : t('stakeToken', { token: ticket.symbol })}
        </TxButton>
      </form>
    </>
  )
}

/**
 * @param props
 * @returns
 */
const RemoveStakeForm: React.FC<{
  chainId: number
  delegator: string
  ticket: Token
}> = (props) => {
  const { chainId, ticket, delegator } = props
  const { t } = useTranslation()

  const [transactionId, setTransactionId] = useState<string>('')
  const transaction = useTransaction(transactionId)
  const {
    register,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<{ [FORM_KEY]: string }>({
    mode: 'onTouched',
    shouldUnregister: true
  })
  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const amount = watch(FORM_KEY)
  const {
    data: stake,
    isFetched: isStakeFetched,
    refetch: refetchStake
  } = useDelegatorsStake(chainId, delegator)

  const onSubmit = async (amount: string) => {
    const amountUnformatted = parseUnits(amount, ticket.decimals)
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)

    // Default case if user has enough allowance
    let callTransaction = () => twabDelegatorContract.unstake(delegator, amountUnformatted)

    setTransactionId(
      sendTransaction({
        name: t('unstake'),
        callTransaction,
        callbacks: {
          onConfirmedByUser: () => reset(),
          onSuccess: () => refetchStake()
        }
      })
    )
  }

  return (
    <>
      <form autoComplete='off' className='flex flex-col'>
        <span className='ml-1 opacity-70'>{t('unstakeAmount', 'Unstake Amount')}</span>
        <StyledInput
          id={FORM_KEY}
          invalid={!!errors?.[FORM_KEY]}
          className='w-full'
          placeholder='eg. 1000'
          {...register(FORM_KEY, {
            required: {
              value: true,
              message: 'Amount is required'
            },
            validate: {
              isNumber: (v) => !isNaN(Number(v)) || 'Amount must be a number',
              isValidBigNumber: (v) => {
                try {
                  parseUnits(v, ticket.decimals)
                  return true
                } catch (e) {
                  return 'Invalid amount'
                }
              },
              isPositive: (v) => Number(v) >= 0 || 'Amount must be a positive number',
              isValidAmount: (v) =>
                stake?.amountUnformatted.gte(parseUnits(v, ticket.decimals)) ||
                'Amount must be less than staked amount'
            }
          })}
        />
        <ErrorMessage className=''>{errors[FORM_KEY]?.message}</ErrorMessage>

        <TxButton
          type='button'
          chainId={chainId}
          state={transaction?.state}
          status={transaction?.status}
          className='w-full capitalize mb-3'
          disabled={!isValid || !isStakeFetched}
          onClick={() => onSubmit(amount)}
        >
          {t('unstakeToken', { token: ticket.symbol })}
        </TxButton>
      </form>
    </>
  )
}
