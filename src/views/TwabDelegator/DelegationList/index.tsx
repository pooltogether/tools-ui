import { useState } from 'react'
import { ActiveState } from './ActiveState'
import { EmptyState } from './EmptyState'
import { ListStateActions } from './ListStateActions'
import { LoadingState } from './LoadingState'
import { EditDelegationModal } from './EditDelegationModal'
import { ConfirmUpdatesModal } from './ConfirmUpdatesModal'
import { CreateDelegationModal } from '@twabDelegator/DelegationList/CreateDelegationModal'
import { useDelegatorsUpdatedTwabDelegations } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegations'
import { useResetDelegationAtomsOnAccountChange } from '@twabDelegator/hooks/useResetDelegationAtomsOnAccountChange'
import classNames from 'classnames'
import { NoDelegatorState } from './NoDelegatorState'
import { TransactionState, useTransaction, useTransactions } from '@pooltogether/wallet-connection'
import { BulkDelegationModal } from './BulkDelegationModal'

export interface DelegationListProps {
  className?: string
  chainId: number
  delegator: string
  setDelegator: (delegator: string) => void
}

export enum ListState {
  readOnly = 'READ_ONLY',
  edit = 'EDIT',
  withdraw = 'WITHDRAW'
}

/**
 *
 * @returns
 */
export const DelegationList: React.FC<DelegationListProps> = (props) => {
  const { chainId, delegator, className, setDelegator } = props
  useResetDelegationAtomsOnAccountChange()
  const useQueryResult = useDelegatorsUpdatedTwabDelegations(chainId, delegator)
  const [listState, setListState] = useState<ListState>(ListState.readOnly)
  const [transactionIds, setTransactionIds] = useState<string[]>()
  const transactions = useTransactions(transactionIds)
  const [signaturePending, setSignaturePending] = useState(false)
  const [chunkingPending, setChunkingPending] = useState(false)

  const transactionsPending =
    transactions.some((transaction) => transaction?.state === TransactionState.pending) ||
    signaturePending ||
    chunkingPending
  const { data: delegations, isFetched } = useQueryResult

  if (isFetched) {
    let list
    if (delegations.length === 0) {
      list = (
        <EmptyState
          {...props}
          className='mb-10'
          delegator={delegator}
          setDelegator={setDelegator}
          listState={listState}
          setListState={setListState}
        />
      )
    } else {
      list = (
        <ActiveState
          {...props}
          className='mb-10'
          delegator={delegator}
          listState={listState}
          setListState={setListState}
          transactionsPending={transactionsPending}
        />
      )
    }
    return (
      <div className={classNames(className, 'text-xxxs xs:text-xs')}>
        <p
          className='text-center text-xs xs:text-sm uppercase font-semibold text-pt-purple-light mt-8 mb-2 xs:mb-2 xs:mt-2'
          id='delegations-title'
        >
          Delegations
        </p>

        {delegations.length >= 1 && (
          <ListStateActions
            chainId={chainId}
            listState={listState}
            delegator={delegator}
            setDelegator={setDelegator}
            setListState={setListState}
            transactionsPending={transactionsPending}
          />
        )}

        <div>{list}</div>

        <EditDelegationModal chainId={chainId} />
        <BulkDelegationModal chainId={chainId} setListState={setListState} />
        <CreateDelegationModal chainId={chainId} delegator={delegator} />
        <ConfirmUpdatesModal
          chainId={chainId}
          delegator={delegator}
          transactionIds={transactionIds}
          setSignaturePending={setSignaturePending}
          setChunkingPending={setChunkingPending}
          setTransactionIds={setTransactionIds}
          onSuccess={() => setListState(ListState.readOnly)}
          transactionsPending={transactionsPending}
        />
      </div>
    )
  } else {
    if (!delegator) {
      return <NoDelegatorState {...props} />
    }
    return <LoadingState {...props} />
  }
}
