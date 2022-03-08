import {
  BlockExplorerLink,
  BottomSheet,
  ModalTitle,
  SquareButton,
  ThemedClipSpinner
} from '@pooltogether/react-components'
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
import { getPriorityConnector } from '@web3-react/core'
import { CONNECTORS } from '../../../connectors'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useResetDelegationAtoms } from '@twabDelegator/hooks/useResetDelegationAtoms'
import { ListState } from '@twabDelegator/DelegationList'
import { DelegationId } from '@twabDelegator/interfaces'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useTicket } from '@hooks/v4/useTicket'
import { getTicketContract } from '@utils/getTicketContract'
import { getTicketContractAddress } from '@utils/getTicketContractAddress'
import { BigNumber, PopulatedTransaction } from 'ethers'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { dToMs } from '@pooltogether/utilities'
import { Transaction, useSendTransaction, useTransaction } from '@atoms/transactions'
import { toast } from 'react-toastify'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'

// TODO: Clean up these hooks
const { usePriorityProvider } = getPriorityConnector(...CONNECTORS)

enum ConfirmModalState {
  review = 'REVIEW',
  receipt = 'RECEIPT'
}

/**
 *
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

  let content
  if (modalState === ConfirmModalState.review) {
    content = (
      <div className='flex flex-col space-y-4'>
        <ModalTitle chainId={chainId} title={'Delegation confirmation'} />
        <DelegationLockWarning />
        <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          setTransactionId={setTransactionId}
          setModalState={setModalState}
          setListState={setListState}
          setSignaturePending={setSignaturePending}
          transactionPending={transactionPending}
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
    <div>
      <FeatherIcon icon='alert-triangle' />
      <p>
        By delegating you are locking up your funds for the expiry period and relinquishing your
        chances of winning to gift those chances to other wallet addresses.
      </p>
      <a>Learn more</a>
    </div>
  )
}

interface SubmitTransactionButtonProps {
  chainId: number
  delegator: string
  transactionPending: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (id: string) => void
  setModalState: (modalState: ConfirmModalState) => void
  setListState: (listState: ListState) => void
}

/**
 * TODO: Keep track of stake and optimize for gas
 *
 * https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    delegator,
    transactionPending,
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
  const provider = usePriorityProvider()
  const usersAddress = useUsersAddress()
  const ticket = useTicket(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )

  const sendTransaction = useSendTransaction(chainId, usersAddress)

  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  const submitUpdateTransaction = async () => {
    setSignaturePending(true)
    const signer = provider.getSigner()
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const ticketContract = getTicketContract(chainId)

    console.log('submitUpdateTransaction', {
      provider,
      signer,
      allowance,
      delegationCreations,
      delegationUpdates,
      delegationFunds,
      delegationWithdrawals,
      chainId,
      delegator,
      twabDelegatorAddress,
      twabDelegatorContract,
      ticketAddress: ticketContract.address
    })

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
      const amountToIncrease = totalAmountToFund.sub(allowance)
      const domain = {
        name: 'PoolTogether ControlledToken',
        version: '1',
        chainId,
        verifyingContract: ticketContract.address
      }
      const signaturePromise = signERC2612Permit(
        signer,
        domain,
        // ticketContract.address,
        usersAddress,
        twabDelegatorContract.address,
        amountToIncrease.toString(),
        17746719831,
        0
      )

      toast.promise(signaturePromise, {
        pending: 'Signature is pending',
        error: 'Signature rejected'
      })

      try {
        // TODO: Signature rejected with wallet connect provider. `send` unavailable. Might need to switch to WAGMI...
        const signature = await signaturePromise

        callTransaction = async () =>
          twabDelegatorContract.permitAndMulticall(
            usersAddress.toLowerCase(),
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
        console.log(e)
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
      }
    })
    setTransactionId(transactionId)
  }

  // TODO: Disable if not on right network
  return (
    <SquareButton
      className='w-full flex space-x-2'
      onClick={submitUpdateTransaction}
      disabled={!isAllowanceFetched || transactionPending}
    >
      <span>Confirm updates</span>
      {transactionPending && <ThemedClipSpinner sizeClassName='w-4 h-4' />}
    </SquareButton>
  )
}
