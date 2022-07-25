import { SquareButton, SquareButtonSize, ThemedClipSpinner } from '@pooltogether/react-components'
import {
  SendTransactionOptions,
  Transaction,
  TransactionState,
  useIsWalletOnChainId,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { delegationChainIdAtom, delegatorAtom } from '@twabDelegator/atoms'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'
import { useIsDelegatorsStakeSufficient } from '@twabDelegator/hooks/useIsDelegatorsStakeSufficient'
import { useIsUserDelegatorsRepresentative } from '@twabDelegator/hooks/useIsUserDelegatorsRepresentative'
import { DelegationFund, DelegationUpdate } from '@twabDelegator/interfaces'
import FeatherIcon from 'feather-icons-react'
import { useAtom } from 'jotai'

export const SubmitBulkDelegations: React.FC<{
  csvUpdates: {
    delegationUpdates: DelegationUpdate[]
    delegationCreations: DelegationUpdate[]
    delegationFunds: DelegationFund[]
  }
  disabled: boolean
  transactions: Transaction[]
  sendTransactions: () => void
  isSignaturePending: boolean
  isChunkingPending: boolean
  bulkSendTransactionOptions: SendTransactionOptions[]
  isTransactionOptionsFetching: boolean
  isTransactionOptionsFetched: boolean
}> = (props) => {
  const {
    csvUpdates,
    sendTransactions,
    transactions,
    disabled,
    isSignaturePending,
    isChunkingPending,
    bulkSendTransactionOptions,
    isTransactionOptionsFetching,
    isTransactionOptionsFetched
  } = props
  const [chainId] = useAtom(delegationChainIdAtom)
  const [delegator] = useAtom(delegatorAtom)
  const usersAddress = useUsersAddress()
  const isWalletOnCorrectNetwork = useIsWalletOnChainId(chainId)
  const { data: isUserARepresentative } = useIsUserDelegatorsRepresentative(
    chainId,
    usersAddress,
    delegator
  )
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(
    chainId,
    delegator,
    csvUpdates.delegationFunds
  )
  const isStakeSufficient = useIsDelegatorsStakeSufficient(
    chainId,
    delegator,
    csvUpdates.delegationFunds
  )

  const isTransactionsInProgress =
    transactions?.length > 0 && !transactions.every((t) => t.state === TransactionState.complete)

  let content: React.ReactNode
  if (isSignaturePending) {
    content = (
      <>
        <ThemedClipSpinner sizeClassName='w-3 h-3' className='mr-1' />
        <span>Pending wallet signature</span>
      </>
    )
  } else if (isChunkingPending || isTransactionOptionsFetching) {
    content = (
      <>
        <ThemedClipSpinner sizeClassName='w-3 h-3' className='mr-1' />
        <span>Building transactions</span>
      </>
    )
  } else if (!isWalletOnCorrectNetwork) {
    content = (
      <>
        <FeatherIcon icon='alert-circle' className='w-4 h-4' />
        <span>Wrong network</span>
      </>
    )
  } else if (!isUserARepresentative && !isBalanceSufficient) {
    content = (
      <>
        <FeatherIcon icon='alert-circle' className='w-4 h-4' />
        <span>Insufficient balance</span>
      </>
    )
  } else if (isUserARepresentative && !isStakeSufficient) {
    content = (
      <>
        <FeatherIcon icon='alert-circle' className='w-4 h-4' />
        <span>Insufficient stake</span>
      </>
    )
  } else if (!isTransactionOptionsFetched) {
    content = (
      <>
        <FeatherIcon icon='alert-circle' className='w-4 h-4' />
        <span>CSV Required</span>
      </>
    )
  } else if (isTransactionsInProgress) {
    content = (
      <>
        <ThemedClipSpinner sizeClassName='w-3 h-3' className='mr-1' />
        <span>Submitting transaction(s)</span>
      </>
    )
  } else if (bulkSendTransactionOptions?.length > 0) {
    content = (
      <>
        <FeatherIcon icon='check-circle' className='w-4 h-4' />
        <span>Submit {bulkSendTransactionOptions.length} transaction(s)</span>
      </>
    )
  } else {
    content = (
      <>
        <FeatherIcon icon='check-circle' className='w-4 h-4' />
        <span>Submit Transaction(s)</span>
      </>
    )
  }

  return (
    <SquareButton
      size={SquareButtonSize.sm}
      disabled={
        disabled ||
        !isWalletOnCorrectNetwork ||
        isTransactionsInProgress ||
        (isUserARepresentative && !isStakeSufficient) ||
        (!isUserARepresentative && !isBalanceSufficient)
      }
      className='flex items-center justify-center space-x-1'
      onClick={sendTransactions}
    >
      {content}
    </SquareButton>
  )
}
