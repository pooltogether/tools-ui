import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import { useState } from 'react'
import { ActiveState } from './ActiveState'
import { EmptyState } from './EmptyState'
import { ListStateActions } from './ListStateActions'
import { LoadingState } from './LoadingState'
import { EditDelegationModal } from './EditDelegationModal'
import { ConfirmUpdatesModal } from './ConfirmUpdatesModal'
import { CreateDelegationModal } from '@twabDelegator/DelegationList/CreateDelegationModal'
import { useDelegatorsUpdatedTwabDelegations } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegations'
import { TransactionState, useTransaction } from '@atoms/transactions'
import { useResetDelegationAtomsOnAccountChange } from '@twabDelegator/hooks/useResetDelegationAtomsOnAccountChange'

export interface DelegationListProps {
  className?: string
  chainId: number
  delegator: string
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
  const { chainId, delegator } = props
  useResetDelegationAtomsOnAccountChange()
  const useQueryResult = useDelegatorsUpdatedTwabDelegations(chainId, delegator)
  const [listState, setListState] = useState<ListState>(ListState.readOnly)
  const [transactionId, setTransactionId] = useState<string>()
  const transaction = useTransaction(transactionId)
  const [signaturePending, setSignaturePending] = useState(false)

  const transactionPending = transaction?.state === TransactionState.pending || signaturePending

  const { data: delegations, isFetched } = useQueryResult

  if (isFetched) {
    let list
    if (delegations.length === 0) {
      list = (
        <EmptyState
          {...props}
          delegator={delegator}
          listState={listState}
          setListState={setListState}
        />
      )
    } else {
      list = (
        <ActiveState
          {...props}
          delegator={delegator}
          listState={listState}
          setListState={setListState}
          transactionPending={transactionPending}
        />
      )
    }
    return (
      <>
        {list}
        {delegations.length >= 1 && (
          <ListStateActions
            chainId={chainId}
            listState={listState}
            delegator={delegator}
            setListState={setListState}
            transactionPending={transactionPending}
          />
        )}
        <EditDelegationModal chainId={chainId} />
        <CreateDelegationModal chainId={chainId} delegator={delegator} />
        <ConfirmUpdatesModal
          chainId={chainId}
          delegator={delegator}
          transactionId={transactionId}
          transactionPending={transactionPending}
          setSignaturePending={setSignaturePending}
          setTransactionId={setTransactionId}
          setListState={setListState}
        />
      </>
    )
  } else {
    return <LoadingState {...props} />
  }
}
