import classNames from 'classnames'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import ICON_CHANCE_GIFTING from '../../assets/images/icon--chance-gifting.svg'
import ICON_PROMO_REWARDS from '../../assets/images/icon--promo-rewards.svg'

interface AppInfo {
  titleKey: string
  descriptionKey: string
  href: string
  iconURL: string | { src: string }
}

const APPS_TO_LIST: AppInfo[] = [
  {
    titleKey: 'Chance Gifting',
    descriptionKey: 'Share your odds with others. Useful for giveaways, competitions, etc.',
    href: 'delegate',
    iconURL: ICON_CHANCE_GIFTING
  },
  {
    titleKey: 'Promo Rewards',
    descriptionKey:
      'Reward PoolTogether depositors on specific pools or chains with any ERC20 tokens',
    href: 'twab-rewards',
    iconURL: ICON_PROMO_REWARDS
  }
]

/**
 * App list is the list of apps to display in the App Index
 * @returns
 */
export const AppIndexList: React.FC = () => {
  return (
    <ul className='flex flex-col space-y-4'>
      {APPS_TO_LIST.map((appInfo) => (
        <AppLink key={appInfo.href} {...appInfo} />
      ))}
    </ul>
  )
}

const AppLink: React.FC<AppInfo> = (props) => {
  const { titleKey, descriptionKey, href, iconURL } = props
  const { t, i18n } = useTranslation()
  return (
    <Link href={href}>
      <a>
        <ListItemContainer>
          <img
            className='w-8 h-8 xs:w-10 xs:h-10 mx-6 mb-2'
            src={typeof iconURL === 'object' && iconURL.src}
          />
          <h6 className='text-white font-normal mb-2'>{t(titleKey)}</h6>
          <p className='text-white text-opacity-70 text-center text-xxs'>{descriptionKey}</p>
        </ListItemContainer>
      </a>
    </Link>
  )
}

const ListItemContainer: React.FC = (props) => (
  <li
    {...props}
    className='p-6 xs:px-24 sm:px-32 rounded-xl flex flex-col items-center'
    style={{ backgroundColor: '#411D89' }}
  />
)
