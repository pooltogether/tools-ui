import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'

export const TokenFaucetDescription: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <p className='text-accent-1 text-xxs'>
        Claim some tokens to interact with our test network! Use your browser to search for anything
        specific. Need different tokens? Chat with us on{' '}
        <a
          className='transition underline text-pt-teal hover:opacity-70 inline-flex items-center space-x-1 text-xxs'
          href={'https://pooltogether.com/discord'}
          target='_blank'
          rel='noreferrer'
        >
          <span>{t('discord')}</span>
          <FeatherIcon icon='external-link' className='w-3 h-3' />
        </a>
      </p>
    </div>
  )
}
