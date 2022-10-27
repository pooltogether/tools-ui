import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import { PromotionsListProps } from '.'

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
      <p className='text-xs font-semibold text-pt-purple-dark dark:text-pt-purple-light opacity-80'>
        {t('noPromotionsFound')}
      </p>
      <p className='font-bold text-xs'>
        {t('createYourFirstPromotionNow', 'Get started by creating your first promotion now:')}
      </p>
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
    <Button
      size={ButtonSize.sm}
      className={className}
      onClick={() => {
        setIsOpen(true)
      }}
    >
      <FeatherIcon icon='plus' strokeWidth={4} className='w-4 h-4 my-auto mr-1' />
      <span>{t('newPromotion')}</span>
    </Button>
  )
}
