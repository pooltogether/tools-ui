import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
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
  const { className, delegator, setListState } = props

  return (
    <div className={className}>
      <CreateSlotButton className='mx-auto' delegator={delegator} setListState={setListState} />
    </div>
  )
}

const CreateSlotButton: React.FC<{
  setListState: (listState: ListState) => void
  delegator: string
  className?: string
}> = (props) => {
  const { className, delegator, setListState } = props
  const usersAddress = useUsersAddress()
  const setIsOpen = useUpdateAtom(createDelegationModalOpenAtom)

  if (delegator !== usersAddress) return null

  return (
    <SquareButton
      theme={SquareButtonTheme.tealOutline}
      size={SquareButtonSize.sm}
      className={className}
      onClick={() => {
        setListState(ListState.edit)
        setIsOpen(true)
      }}
    >
      <FeatherIcon icon='plus' className='w-3 h-3 my-auto mr-1' />
      <span>Create Delegation</span>
    </SquareButton>
  )
}
