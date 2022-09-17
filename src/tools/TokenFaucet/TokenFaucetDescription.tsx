import { ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'

export const TokenFaucetDescription: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <p className='text-accent-1 text-xxs'>{t('pooltogetherTokenFaucetDescription')}</p>
      <a
        className='transition underline text-pt-teal hover:opacity-70 inline-flex items-center space-x-1 text-xxs'
        href={'https://info.pooltogether.com/faucets'}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('moreInfo', 'More info')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </div>
  )
}
