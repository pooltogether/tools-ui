import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { createDelegationModalOpenAtom } from '@twabDelegator/atoms'
import { useUpdateAtom } from 'jotai/utils'
import { DelegationListProps, ListState } from '.'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  return (
    <div
      className={classNames(
        className,
        'rounded-lg py-8 px-4 xs:px-12 text-center flex-col space-y-4 items-center bg-darkened'
      )}
    >
      <p className='uppercase text-xxs font-semibold text-pt-purple-dark dark:text-pt-purple-light'>
        {t('noDelegationsFound')}
      </p>
      <p className='font-bold text-xs'>{t('getStartedByDelegating')}</p>
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
  const { t } = useTranslation()

  if (delegator !== usersAddress) return null

  return (
    <SquareButton
      size={SquareButtonSize.sm}
      className={className}
      onClick={() => {
        setListState(ListState.edit)
        setIsOpen(true)
      }}
    >
      <FeatherIcon icon='plus' strokeWidth={4} className='w-4 h-4 my-auto mr-1' />
      <span>{t('newDelegation')}</span>
    </SquareButton>
  )
}
