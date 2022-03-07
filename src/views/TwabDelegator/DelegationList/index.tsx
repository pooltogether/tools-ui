import { useUsersAddress } from '@hooks/useUsersAddress'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useState } from 'react'
import { ActiveState } from './ActiveState'
import { EmptyState } from './EmptyState'
import { ListStateActions } from './ListStateActions'
import { LoadingState } from './LoadingState'
import { EditDelegationModal } from './EditDelegationModal'
import { ConfirmUpdatesModal } from './ConfirmUpdatesModal'

export interface DelegationListProps {
  className?: string
  chainId: number
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
  const { chainId } = props
  // TODO: Expand delegator address for reps
  const delegator = useUsersAddress()
  const useQueryResult = useDelegatorsTwabDelegations(chainId, delegator)
  const [listState, setListState] = useState<ListState>(ListState.readOnly)

  const { data: delegations, isFetched, error } = useQueryResult

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
        />
      )
    }
    return (
      <>
        {list}
        <ListStateActions listState={listState} setListState={setListState} />
        <EditDelegationModal chainId={chainId} />
        <ConfirmUpdatesModal chainId={chainId} delegator={delegator} setListState={setListState} />
      </>
    )
  } else {
    return <LoadingState {...props} />
  }
}
