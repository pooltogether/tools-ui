import { SquareButton, SquareButtonSize } from '@pooltogether/react-components'
import { useSendSequentialTransactions, useTransactions } from '@pooltogether/wallet-connection'
import { DownloadTemplateCsv } from '@twabDelegator/BulkTwabDelegator/DownloadTemplateCsv'
import { UploadCsv } from '@twabDelegator/BulkTwabDelegator/UploadCsv'
import { useBulkSendTransactionOptions } from '@twabDelegator/hooks/useBulkSendTransactionOptions'
import { DelegationFund, DelegationUpdate } from '@twabDelegator/interfaces'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { BulkDelegationNumberOfTransactions } from './BulkDelegationNumberOfTransactions'
import { BulkDelegationUpdates } from './BulkDelegationUpdates'
import { DownloadDelegationsCsv } from './DownloadDelegationsCsv'
import { SubmitBulkDelegations } from './SubmitBulkDelegations'
import { TransactionsList } from './TransactionsList'

/**
 * TODO: Check for existing locks and block this tool cause that's too annoying to deal with.
 * @returns
 */
export const BulkTwabDelegationSteps = () => {
  const [csvUpdates, setCsvUpdates] = useState<{
    delegationUpdates: DelegationUpdate[]
    delegationCreations: DelegationUpdate[]
    delegationFunds: DelegationFund[]
  }>({
    delegationUpdates: [],
    delegationCreations: [],
    delegationFunds: []
  })
  const [isSignaturePending, setSignaturePending] = useState(false)
  const [isChunkingPending, setChunkingPending] = useState(false)
  const [transactionIds, setTransactionIds] = useState<string[]>([])
  const pushTransactionId = (id: string) => setTransactionIds((ids) => [...ids, id])
  const transactions = useTransactions(transactionIds)

  const { t } = useTranslation()

  const {
    data: bulkSendTransactionOptions,
    isFetched: isTransactionOptionsFetched,
    isFetching: isTransactionOptionsFetching
  } = useBulkSendTransactionOptions(
    csvUpdates,
    setSignaturePending,
    setChunkingPending,
    pushTransactionId,
    () => setTransactionIds([])
  )

  const sendTransactions = useSendSequentialTransactions(bulkSendTransactionOptions, t)

  return (
    <>
      <div className='flex flex-col space-y-3 pt-4'>
        <div className='flex justify-between'>
          <div>
            <b className='mr-1'>1.</b>
            <span>Download a template CSV.</span>
          </div>
          <div className='flex flex-col space-y-2'>
            <DownloadTemplateCsv />
            <DownloadDelegationsCsv />
          </div>
        </div>
        <div className='flex flex-col'>
          <div>
            <b className='mr-1'>2.</b>
            <span>Edit the template.</span>
          </div>
          <div className='flex flex-col pl-4 opacity-80 text-xxs'>
            <span>
              <b>Delegatee</b> is the address to delegate to.
            </span>
            <span>
              <b>Lock duration</b> is the amount of time (in seconds) until the delegator or
              representative can revoke the delegation. Set this value to 0 for no lock duration.
            </span>
            <span>
              <b>Amount</b> is the amount of the token to delegate.
            </span>
          </div>
        </div>
        <div className='flex justify-between'>
          <div>
            <b className='mr-1'>3.</b>
            <span>Upload the template.</span>
          </div>
          <UploadCsv setCsvUpdates={setCsvUpdates} />
        </div>
        <div className='flex flex-col'>
          <div className='flex justify-between'>
            <div>
              <b className='mr-1'>4.</b>
              <span>Submit delegation transaction(s).</span>
            </div>
            <SubmitBulkDelegations
              csvUpdates={csvUpdates}
              disabled={!isTransactionOptionsFetched || isTransactionOptionsFetching}
              sendTransactions={sendTransactions}
              isSignaturePending={isSignaturePending}
              isChunkingPending={isChunkingPending}
              bulkSendTransactionOptions={bulkSendTransactionOptions}
              isTransactionOptionsFetching={isTransactionOptionsFetching}
              isTransactionOptionsFetched={isTransactionOptionsFetched}
              transactions={transactions}
            />
          </div>
          <div className='flex flex-col pl-4 space-y-1'>
            <BulkDelegationUpdates csvUpdates={csvUpdates} />
            <TransactionsList transactions={transactions} />
          </div>
        </div>
      </div>
    </>
  )
}
