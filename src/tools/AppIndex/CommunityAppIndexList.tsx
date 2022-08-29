import { ExternalLink, Modal, SquareLink } from '@pooltogether/react-components'
import { useTransaction } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface AppInfo {
  titleKey: string
  descriptionKey: string
  href: string
  twitter?: string
  discordName?: string
  discordId?: string
  github?: string
  repo?: string
  ignoreNoRepo?: boolean
}

const APPS_TO_LIST: AppInfo[] = [
  {
    titleKey: 'poolyTitle',
    descriptionKey: 'poolyDescription',
    href: 'https://discord.com/users/932147757836292096/',
    twitter: 'underethsea',
    github: 'underethsea',
    repo: 'https://github.com/underethsea/pooly'
  },
  {
    titleKey: 'sarfangDuneTitle',
    descriptionKey: 'sarfangDuneDescription',
    href: 'https://dune.xyz/sarfang/PoolTogetherV4',
    twitter: 'sarfang_',
    ignoreNoRepo: true
  },
  {
    titleKey: 'poolExplorerTitle',
    descriptionKey: 'poolExplorerDescription',
    href: 'https://poolexplorer.win/',
    twitter: 'underethsea',
    github: 'underethsea'
  },
  {
    titleKey: 'multidelegatorCalculatorTitle',
    descriptionKey: 'multidelegatorCalculatorDescription',
    href: 'https://prizecalc.com/',
    twitter: 'ncookie_eth',
    github: 'Ncookiez',
    repo: 'https://github.com/Ncookiez/pooltogether-multidelegator-preview'
  },
  {
    titleKey: 'telegramBotTitle',
    descriptionKey: 'telegramBotDescription',
    href: 'https://t.me/PTWinsTracker_bot',
    discordId: '185689161695494146',
    discordName: 'Max'
  },
  {
    titleKey: 'communityApiTitle',
    descriptionKey: 'communityApiDescription',
    href: 'https://github.com/underethsea/explorer-api',
    twitter: 'underethsea',
    github: 'underethsea',
    repo: 'https://github.com/underethsea/explorer-api'
  },
  {
    titleKey: 'poolStatsTitle',
    descriptionKey: 'poolStatsDescription',
    href: 'https://pool-stats.netlify.app/',
    twitter: 'ncookie_eth',
    github: 'Ncookiez',
    repo: 'https://github.com/Ncookiez/pooltogether-stats'
  }
]

/**
 * App list is the list of apps to display in the Tools Index
 * @returns
 */
export const CommunityAppIndexList: React.FC = () => {
  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-4'>
      {APPS_TO_LIST.map((appInfo) => (
        <AppLink key={appInfo.href} {...appInfo} />
      ))}
    </ul>
  )
}

const AppLink: React.FC<AppInfo> = (props) => {
  const {
    titleKey,
    descriptionKey,
    href,
    twitter,
    github,
    repo,
    ignoreNoRepo,
    discordId,
    discordName
  } = props
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ListItemContainer>
      <button
        onClick={() => setIsOpen(true)}
        className='rounded-xl flex flex-col items-center w-full h-full p-6 xs:px-24 sm:px-32 bg-pt-purple-bright hover:bg-pt-purple transition'
      >
        <h6 className='text-white font-normal mb-2 text-center'>{t(titleKey)}</h6>
        <p className='text-white text-opacity-70 text-center text-xxs'>{t(descriptionKey)}</p>
      </button>
      <Modal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        label={'external-dapp-link'}
        className='flex flex-col items-center'
      >
        <span className='text-5xl mb-4'>👋</span>
        <div className='text-center mb-8'>
          <p className='text-lg mb-6'>
            {t('headsUpLeavingPT', `Heads up, you're leaving PoolTogether.com`)}
          </p>
          <UserLink
            twitter={twitter}
            github={github}
            discordId={discordId}
            discordName={discordName}
          />
          <RepoLink repo={repo} ignoreNoRepo={ignoreNoRepo} />
        </div>
        <SquareLink href={href} className='w-full space-x-2 items-center'>
          <span>{t('iUnderstand')}</span>
          <FeatherIcon icon={'external-link'} className='w-4 h-4' />
        </SquareLink>
      </Modal>
    </ListItemContainer>
  )
}

const ListItemContainer: React.FC = (props) => (
  <li {...props} className={classNames('flex flex-col items-center relative')} />
)

const UserLink: React.FC<{
  twitter?: string
  github?: string
  discordId?: string
  discordName?: string
}> = (props) => {
  const { twitter, github, discordId, discordName } = props

  if (twitter || github || (discordId && discordName)) {
    let url
    if (!!twitter) {
      url = `https://twitter.com/${twitter}`
    } else if (!!github) {
      url = `https://github.com/${github}`
    } else {
      url = `https://discord.com/users/${discordId}/`
    }

    return (
      <p className='text-xs'>
        <Trans
          i18nKey='redirectedToApp'
          components={{
            a: <ExternalLink href={url} />
          }}
          values={{ name: twitter || github || discordName }}
        />
      </p>
    )
  }

  return null
}

const RepoLink: React.FC<{ repo?: string; ignoreNoRepo?: boolean }> = (props) => {
  const { repo, ignoreNoRepo } = props
  const { t } = useTranslation()

  if (ignoreNoRepo) return null

  if (!repo) {
    return (
      <p className='text-xs text-pt-red-light'>
        {t('appNotOpenSource', 'This app is not open source. The code cannot be verified.')}
      </p>
    )
  }

  return (
    <p className='text-xs'>
      <Trans i18nKey='openSourceAppVerifyHere' components={{ a: <ExternalLink href={repo} /> }} />
    </p>
  )
}
