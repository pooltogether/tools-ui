import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { DELEGATION_LEARN_MORE_URL } from './constants'
import { useTranslation } from 'react-i18next'

export const DelegationDescription: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <p className='text-accent-1 text-xxs'>{t('delegationTitleDescription')}</p>
      <a
        className='transition underline text-pt-teal hover:opacity-70 inline-flex items-center space-x-1 text-xxs'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </div>
  )
}
