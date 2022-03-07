import { SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import {
  delegationFormDefaultsAtom,
  delegationIdToEditAtom,
  editDelegationModalOpenAtom
} from '@twabDelegator/atoms'
import { useNextSlot } from '@twabDelegator/hooks/useNextSlot'
import { useUpdateAtom } from 'jotai/utils'
import { DelegationListProps, ListState } from '.'

interface EmptyStateProps extends DelegationListProps {
  delegator: string
  listState: ListState
  setListState: (listState: ListState) => void
}

/**
 *
 * @param props
 * @returns
 */
export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { className, chainId, delegator, setListState } = props
  return (
    <div className={className}>
      <CreateSlotButton
        className='mx-auto'
        chainId={chainId}
        delegator={delegator}
        setListState={setListState}
      />
    </div>
  )
}

const CreateSlotButton: React.FC<{
  chainId: number
  delegator: string
  setListState: (listState: ListState) => void
  className?: string
}> = (props) => {
  const { chainId, delegator, className, setListState } = props
  const setIsOpen = useUpdateAtom(editDelegationModalOpenAtom)
  const setDelegationFormDefaults = useUpdateAtom(delegationFormDefaultsAtom)
  const setDelegationIdToEdit = useUpdateAtom(delegationIdToEditAtom)
  const nextSlotId = useNextSlot(chainId, delegator)

  return (
    <SquareButton
      theme={SquareButtonTheme.tealOutline}
      className={className}
      onClick={() => {
        setListState(ListState.edit)
        setDelegationIdToEdit({
          slot: nextSlotId,
          delegator
        })
        setDelegationFormDefaults({
          balance: '',
          delegatee: '',
          duration: 0
        })
        setIsOpen(true)
      }}
    >
      Create Delegation
    </SquareButton>
  )
}
