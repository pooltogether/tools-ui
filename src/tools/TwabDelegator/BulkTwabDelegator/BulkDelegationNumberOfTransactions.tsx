import { SendTransactionOptions } from '@pooltogether/wallet-connection'
import { EditedIconAndCount } from '@twabDelegator/DelegationList/ListStateActions'
import { DelegationFund, DelegationUpdate } from '@twabDelegator/interfaces'
import { chunkArray } from '@utils/chunkArray'
import { useTranslation } from 'next-i18next'

export const BulkDelegationNumberOfTransactions: React.FC<{
  isSignaturePending: boolean
  isChunkingPending: boolean
  bulkSendTransactionOptions: SendTransactionOptions[]
  isTransactionOptionsFetching: boolean
  isTransactionOptionsFetched: boolean
}> = (props) => {
  const {
    isSignaturePending,
    isChunkingPending,
    isTransactionOptionsFetching,
    isTransactionOptionsFetched,
    bulkSendTransactionOptions
  } = props
  const { t } = useTranslation()

  let content: React.ReactNode

  if (isSignaturePending) {
    content = 'Pending wallet signature'
  } else if (isChunkingPending || isTransactionOptionsFetching) {
    content = 'Building transactions'
  } else if (!isTransactionOptionsFetched) {
    return null
  } else {
    content = `${bulkSendTransactionOptions.length} transaction(s)`
  }

  return <div>{content}</div>
}
