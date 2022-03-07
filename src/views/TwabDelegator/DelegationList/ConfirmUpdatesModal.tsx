import { BottomSheet, ModalTitle, SquareButton } from '@pooltogether/react-components'
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
import { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getMulticallContract } from '@utils/getMulticallContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useResetDelegationAtoms } from '@twabDelegator/hooks/useResetDelegationAtoms'
import { ListState } from '@twabDelegator/DelegationList'
import { DelegationId } from '@twabDelegator/interfaces'
import { BigNumber, PopulatedTransaction, UnsignedTransaction } from 'ethers'

// TODO: Clean up these hooks
const { usePriorityProvider } = getPriorityConnector(...CONNECTORS)

enum ConfirmModalState {
  // approve = 'APPROVE' // TODO: Approve state if user is funding more than they have approved
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
  setListState: (listState: ListState) => void
}> = (props) => {
  const { chainId, delegator, setListState } = props
  const [modalState, setModalState] = useState(ConfirmModalState.review)
  const [isOpen, setIsOpen] = useAtom(delegationUpdatesModalOpenAtom)

  let content
  if (modalState === ConfirmModalState.review) {
    content = (
      <>
        <ModalTitle chainId={chainId} title={'Delegation confirmation'} />
        <DelegationLockWarning />
        <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          setModalState={setModalState}
          setListState={setListState}
        />
      </>
    )
  } else {
    content = (
      <>
        <ModalTitle chainId={chainId} title={'Delegation transaction submitted'} />
        <p>Receipt button</p>
      </>
    )
  }

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
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
  const { chainId, delegator, setListState } = props
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)
  const { data: delegations, refetch } = useDelegatorsTwabDelegations(chainId, delegator)
  const resetAtoms = useResetDelegationAtoms()
  const provider = usePriorityProvider()

  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  const submitUpdateTransaction = async () => {
    const signer = provider.getSigner()
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)

    console.log('submitUpdateTransaction', {
      delegationCreations,
      delegationUpdates,
      delegationFunds,
      delegationWithdrawals,
      chainId,
      delegator,
      twabDelegatorAddress,
      twabDelegatorContract
    })

    const calls: string[] = []

    // Add creations to the list of transactions
    for (const delegationCreation of delegationCreations) {
      console.log('delegationCreation', { delegationCreation })
      const { slot, delegatee, lockDuration } = delegationCreation
      const populatedTx = await twabDelegatorContract.populateTransaction.createDelegation(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      calls.push(populatedTx.data)
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
      calls.push(populatedTx.data)
    }

    // Add withdrawals to the list of transactions
    // TODO: Calling fund subtracts from the amount, it doesn't overwrite the number.
    // Amount should be the full delegated amount.
    for (const delegationWithdrawal of delegationWithdrawals) {
      const { slot, amount } = delegationWithdrawal
      const delegation = getDelegation(delegationWithdrawal)
      const amountToWithdraw = delegation.delegation.balance.sub(amount)
      console.log('amountToWithdraw', { a: amountToWithdraw.toString() })
      const populatedTx = await twabDelegatorContract.populateTransaction.withdrawDelegationToStake(
        delegator,
        slot,
        amountToWithdraw
      )
      calls.push(populatedTx.data)
    }

    // Add funds to the list of transactions
    // TODO: Calling fund adds to the amount, it doesn't overwrite the number.
    // If amount is less than current delegation, need to call withdrawDelegationFromStake.
    for (const delegationFund of delegationFunds) {
      const { slot, amount } = delegationFund
      const delegation = getDelegation(delegationFund)
      let amountToFund: BigNumber
      if (delegation) {
        amountToFund = amount.sub(delegation.delegation.balance)
      } else {
        amountToFund = amount
      }

      let populatedTx: PopulatedTransaction
      if (amountToFund.isNegative()) {
        populatedTx = await twabDelegatorContract.populateTransaction.withdrawDelegationToStake(
          delegator,
          slot,
          amountToFund.mul(-1)
        )
      } else {
        populatedTx = await twabDelegatorContract.populateTransaction.fundDelegationFromStake(
          delegator,
          slot,
          amountToFund
        )
      }
      calls.push(populatedTx.data)
    }

    console.log({ calls, signer })

    // TODO: Change state to react to transaction
    const txResponse: TransactionResponse = await twabDelegatorContract.functions.multicall(calls)
    console.log({ txResponse })
    const txReceipt = await txResponse.wait()
    console.log({ txReceipt })
    await refetch()
    resetAtoms()
    setListState(ListState.readOnly)
  }

  return (
    <SquareButton className='w-full' onClick={submitUpdateTransaction}>
      Confirm updates
    </SquareButton>
  )
}

/**
 * twabDelegatorContract.populateTransaction.createDelegation()
 * twabDelegatorContract.populateTransaction.updateDelegatee()
 * twabDelegatorContract.populateTransaction.fundDelegation()
 * twabDelegatorContract.populateTransaction.fundDelegationFromStake()
 * twabDelegatorContract.populateTransaction.withdrawDelegationToStake()
 * twabDelegatorContract.populateTransaction.withdraw()
 * twabDelegatorContract.populateTransaction.stake()
 *
 * To deposit:
 * - Fund stake with difference between stake balance and amount to delegate (stake)
 * - Fund delegations from stake (fundDelegationFromStake)
 *
 * To withdraw:
 * - Withdraw delegation to stake for each delegation (withdrawDelegationToStake)
 * - Withdraw (withdraw)
 *
 * Must call createDelegation if the delegation in that slot HASN'T been created.
 * Must call updateDelegatee if delegation in that slot HAS been created.
 */
