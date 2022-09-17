import { ThemedClipSpinner } from '@pooltogether/react-components'
import {
  BlockExplorerLink,
  Transaction,
  TransactionState,
  TransactionStatus
} from '@pooltogether/wallet-connection'
import FeatherIcon from 'feather-icons-react'

export const TransactionsList: React.FC<{ transactions: Transaction[] }> = (props) => {
  const { transactions } = props
  if (transactions.length === 0) return null

  return (
    <>
      <div className='opacity-80 text-xxs mb-1'>Transactions</div>
      <ul className='space-y-1 text-xxxs pl-2'>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </>
  )
}

const TransactionItem: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props
  return (
    <li key={transaction.id} className='flex space-x-2 items-center'>
      <TransactionStatusIcon transaction={transaction} />
      {!!transaction.response ? (
        <BlockExplorerLink chainId={transaction.chainId} txHash={transaction.response.hash}>
          {transaction.name}
        </BlockExplorerLink>
      ) : (
        <span>{transaction.name}</span>
      )}
    </li>
  )
}

const TransactionStatusIcon: React.FC<{
  transaction: Transaction
}> = (props) => {
  const { transaction } = props

  if (transaction.state === TransactionState.pending) {
    return <ThemedClipSpinner sizeClassName='w-3 h-3' />
  } else if (
    transaction.status === TransactionStatus.error ||
    transaction.status === TransactionStatus.cancelled
  ) {
    return <FeatherIcon icon='x-circle' className='text-pt-red-light w-3 h-3' />
  } else {
    return <FeatherIcon icon='check-circle' className='text-pt-teal w-3 h-3' />
  }
}
