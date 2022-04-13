import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import { useUpdateAtom } from 'jotai/utils'
import { PromotionsListProps } from '.'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

interface EmptyStateProps extends PromotionsListProps {
  currentAccount: string
}

/**
 *
 * @param props
 * @returns
 */
export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { className, currentAccount } = props
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
      <CreatePromotionButton className='mx-auto' currentAccount={currentAccount} />
    </div>
  )
}

const CreatePromotionButton: React.FC<{
  currentAccount: string
  className?: string
}> = (props) => {
  const { className, currentAccount } = props
  const usersAddress = useUsersAddress()
  const setIsOpen = useUpdateAtom(createPromotionModalOpenAtom)
  const { t } = useTranslation()

  if (currentAccount !== usersAddress) return null

  return (
    <SquareButton
      size={SquareButtonSize.sm}
      className={className}
      onClick={() => {
        setIsOpen(true)
      }}
    >
      <FeatherIcon icon='plus' strokeWidth={4} className='w-4 h-4 my-auto mr-1' />
      <span>{t('newPromotion')}</span>
    </SquareButton>
  )
}
