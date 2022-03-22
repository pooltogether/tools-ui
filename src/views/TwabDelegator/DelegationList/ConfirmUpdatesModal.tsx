import { Banner, BannerTheme, BottomSheet, ModalTitle } from '@pooltogether/react-components'
import { signERC2612Permit } from 'eth-permit'
import FeatherIcon from 'feather-icons-react'
import {
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatedLocksCountAtom,
  delegationUpdatesAtom,
  delegationUpdatesModalOpenAtom,
  delegationWithdrawalsAtom
} from '@twabDelegator/atoms'
import { useAtom } from 'jotai'
import { DelegationConfirmationList } from './DelegationConfirmationList'
import { useState } from 'react'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useResetDelegationAtoms } from '@twabDelegator/hooks/useResetDelegationAtoms'
import { ListState } from '@twabDelegator/DelegationList'
import { DelegationId } from '@twabDelegator/interfaces'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useTicket } from '@hooks/v4/useTicket'
import { getTicketContract } from '@utils/getTicketContract'
import { BigNumber, PopulatedTransaction } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { toast } from 'react-toastify'
import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TransactionButton } from '@components/Buttons/TransactionButton'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'
import { useSignTypedData } from 'wagmi'
import { getPoolTogetherDepositUrl } from '@utils/getPoolTogetherDepositUrl'
import { DELEGATION_LEARN_MORE_URL } from '@twabDelegator/constants'
import {
  useSendTransaction,
  useTransaction,
  useUsersAddress,
  useWalletSigner
} from '@pooltogether/wallet-connection'
import { useTotalAmountDelegated } from '@twabDelegator/hooks/useTotalAmountDelegated'

enum ConfirmModalState {
  review = 'REVIEW',
  receipt = 'RECEIPT'
}

/**
 * TODO: Show users Ticket balance after the update goes through: 526.12 PTaUSDC - (100 PTaUSDC in update)
 * @param props
 * @returns
 */
export const ConfirmUpdatesModal: React.FC<{
  chainId: number
  delegator: string
  transactionId: string
  transactionPending: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (transactionId: string) => void
  setListState: (listState: ListState) => void
}> = (props) => {
  const {
    chainId,
    delegator,
    transactionId,
    transactionPending,
    setSignaturePending,
    setListState,
    setTransactionId
  } = props
  const [modalState, setModalState] = useState(ConfirmModalState.review)
  const [isOpen, setIsOpen] = useAtom(delegationUpdatesModalOpenAtom)
  const transaction = useTransaction(transactionId)
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(chainId, delegator)

  let content
  if (modalState === ConfirmModalState.review) {
    content = (
      <div className='flex flex-col space-y-4'>
        <ModalTitle chainId={chainId} title={'Delegation confirmation'} />
        <TicketBalanceWarning chainId={chainId} isBalanceSufficient={isBalanceSufficient} />
        <DelegationLockWarning />
        <div>
          <p className='text-xs font-bold mb-1'>Review changes</p>
          <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        </div>
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          transactionPending={transactionPending}
          isBalanceSufficient={isBalanceSufficient}
          setIsOpen={setIsOpen}
          setTransactionId={setTransactionId}
          setModalState={setModalState}
          setListState={setListState}
          setSignaturePending={setSignaturePending}
        />
      </div>
    )
  } else {
    content = (
      <div className='flex flex-col space-y-12'>
        <ModalTitle chainId={chainId} title={'Delegation transaction submitted'} />
        <TransactionReceiptButton chainId={chainId} transaction={transaction} />
      </div>
    )
  }

  return (
    <BottomSheet
      label='delegation-edit-modal'
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false)
        if (!transactionPending) {
          setModalState(ConfirmModalState.review)
        }
      }}
    >
      {content}
    </BottomSheet>
  )
}

/**
 *
 * @returns
 */
const DelegationLockWarning: React.FC = () => {
  const [lockCount] = useAtom(delegationUpdatedLocksCountAtom)

  if (!lockCount) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-yellow' />
      <p className='text-xs'>
        By delegating you are locking up your funds for the expiry period and relinquishing your
        chances of winning to gift those chances to other wallet addresses.
      </p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>Learn more about Chance Delegating</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

const TicketBalanceWarning: React.FC<{ isBalanceSufficient: boolean; chainId: number }> = (
  props
) => {
  const { isBalanceSufficient, chainId } = props

  if (isBalanceSufficient === null || isBalanceSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>
        Delegated amount exceeds current ticket balance. Please lower some delegation amounts or
        deposit more into PoolTogether.
      </p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={getPoolTogetherDepositUrl(chainId)}
        target='_blank'
        rel='noreferrer'
      >
        <span>Deposit more</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

interface SubmitTransactionButtonProps {
  chainId: number
  delegator: string
  transactionPending: boolean
  isBalanceSufficient: boolean
  setIsOpen: (isOpen: boolean) => void
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (id: string) => void
  setModalState: (modalState: ConfirmModalState) => void
  setListState: (listState: ListState) => void
}

/**
 * https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    delegator,
    transactionPending,
    isBalanceSufficient,
    setIsOpen,
    setSignaturePending,
    setModalState,
    setListState,
    setTransactionId
  } = props
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)
  const { data: delegations, refetch } = useDelegatorsTwabDelegations(chainId, delegator)
  const resetAtoms = useResetDelegationAtoms()
  const signer = useWalletSigner()
  const usersAddress = useUsersAddress()
  const ticket = useTicket(chainId)
  const twabDelegator = getTwabDelegatorContractAddress(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const { refetch: refetchTicketBalance } = useTokenBalance(chainId, delegator, ticket.address)
  const { refetch: refetchDelegationBalance } = useTotalAmountDelegated(chainId, delegator)

  const sendTransaction = useSendTransaction(chainId, usersAddress)

  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  const submitUpdateTransaction = async () => {
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const ticketContract = getTicketContract(chainId)
    const fnCalls: string[] = []
    let totalAmountToFund = BigNumber.from(0)

    // Add creations to the list of transactions
    for (const delegationCreation of delegationCreations) {
      const { slot, delegatee, lockDuration } = delegationCreation
      const populatedTx = await twabDelegatorContract.populateTransaction.createDelegation(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add updates to the list of transactions
    for (const delegationUpdate of delegationUpdates) {
      const { slot, delegatee, lockDuration } = delegationUpdate
      const populatedTx = await twabDelegatorContract.populateTransaction.updateDelegatee(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add withdrawals to the list of transactions
    for (const delegationWithdrawal of delegationWithdrawals) {
      const { slot, amount } = delegationWithdrawal
      const delegation = getDelegation(delegationWithdrawal)
      const amountToWithdraw = delegation.delegation.balance.sub(amount)
      const populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
        slot,
        amountToWithdraw,
        delegator
      )
      fnCalls.push(populatedTx.data)
    }

    // Add funds to the list of transactions
    for (const delegationFund of delegationFunds) {
      const { slot, amount } = delegationFund
      const delegation = getDelegation(delegationFund)
      let amountToFund: BigNumber

      // If there's an existing delegation, amountToFund is the difference
      if (!!delegation) {
        amountToFund = amount.sub(delegation.delegation.balance)
      } else {
        amountToFund = amount
      }

      let populatedTx: PopulatedTransaction
      if (amountToFund.isNegative()) {
        const amountToWithdraw = amountToFund.mul(-1)
        populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
          slot,
          amountToWithdraw,
          delegator
        )
      } else {
        totalAmountToFund = totalAmountToFund.add(amountToFund)
        populatedTx = await twabDelegatorContract.populateTransaction.fundDelegation(
          delegator,
          slot,
          amountToFund
        )
      }
      fnCalls.push(populatedTx.data)
    }

    let callTransaction: () => Promise<TransactionResponse>

    // Ensure allowance is high enough. Get signature for permitAndMulticall.
    if (!totalAmountToFund.isZero() && allowance.lt(totalAmountToFund)) {
      setSignaturePending(true)

      const amountToIncrease = totalAmountToFund.sub(allowance)
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
        pending: 'Signature is pending',
        error: 'Signature rejected'
      })

      try {
        // TODO: Signature rejected with wallet connect provider. `_provider.send` is unavailable. Maybe try to switch to WAGMI or fiddle with web3-react connectors...
        const signature = await signaturePromise

        callTransaction = async () =>
          twabDelegatorContract.permitAndMulticall(
            amountToIncrease,
            {
              deadline: signature.deadline,
              v: signature.v,
              r: signature.r,
              s: signature.s
            },
            fnCalls
          )
      } catch (e) {
        setSignaturePending(false)
        console.error(e)
        return
      }
    } else {
      callTransaction = async () => twabDelegatorContract.multicall(fnCalls)
    }

    const transactionId = sendTransaction('Update delegations', callTransaction, {
      onSent: () => {
        setSignaturePending(false)
      },
      onConfirmed: () => {
        setModalState(ConfirmModalState.receipt)
      },
      onSuccess: async () => {
        await refetch()
        resetAtoms()
        setListState(ListState.readOnly)
        setIsOpen(false)
        refetchDelegationBalance()
        refetchTicketBalance()
        setModalState(ConfirmModalState.review)
      }
    })
    setTransactionId(transactionId)
  }

  return (
    <TransactionButton
      className='w-full'
      onClick={submitUpdateTransaction}
      disabled={!signer || !isAllowanceFetched || transactionPending || !isBalanceSufficient}
      pending={transactionPending}
      chainId={chainId}
      toolTipId={'confirm-delegation-updates'}
    >
      Confirm updates
    </TransactionButton>
  )
}
