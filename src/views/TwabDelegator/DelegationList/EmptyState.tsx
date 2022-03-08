import { SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { createDelegationModalOpenAtom } from '@twabDelegator/atoms'
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
  const { className, setListState } = props
  return (
    <div className={className}>
      <CreateSlotButton className='mx-auto' setListState={setListState} />
    </div>
  )
}

const CreateSlotButton: React.FC<{
  setListState: (listState: ListState) => void
  className?: string
}> = (props) => {
  const { className, setListState } = props
  const setIsOpen = useUpdateAtom(createDelegationModalOpenAtom)

  return (
    <SquareButton
      theme={SquareButtonTheme.tealOutline}
      className={className}
      onClick={() => {
        setListState(ListState.edit)
        setIsOpen(true)
      }}
    >
      Create Delegation
    </SquareButton>
  )
}
