import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import ICON_CHANCE_GIFTING from '../../assets/images/icon--chance-gifting.svg'
import ICON_PROMO_REWARDS from '../../assets/images/icon--promo-rewards.svg'
import ICON_VOTE from '../../assets/images/icon--vote.svg'
import ICON_INFO from '../../assets/images/icon--info.svg'
import classNames from 'classnames'

interface AppInfo {
  titleKey: string
  descriptionKey: string
  iconURL: string | { src: string }
  href: string
  disabled?: boolean
}

const APPS_TO_LIST: AppInfo[] = [
  {
    titleKey: 'Deposit Delegator',
    descriptionKey: 'Delegate your chances to win without losing custody of your deposit.',
    href: 'delegate',
    iconURL: ICON_CHANCE_GIFTING
  },
  {
    titleKey: 'Promotional Rewards',
    descriptionKey:
      'Reward PoolTogether depositors on specific pools or chains with any ERC20 tokens.',
    href: 'promo',
    disabled: true,
    iconURL: ICON_PROMO_REWARDS
  },
  {
    titleKey: 'PoolTogether Governance',
    descriptionKey:
      'Create and vote on proposals that control the PoolTogether protocol with POOL.',
    href: 'https://vote.pooltogether.com',
    iconURL: ICON_VOTE
  },
  {
    titleKey: 'PoolTogether Info',
    descriptionKey: 'Analytics for the PoolTogether protocol.',
    href: 'https://info.pooltogether.com',
    iconURL: ICON_INFO
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
  const { titleKey, descriptionKey, disabled, href, iconURL } = props
  const { t, i18n } = useTranslation()
  return (
    <Link href={href}>
      <a
        className={classNames({
          'pointer-events-none': disabled
        })}
      >
        <ListItemContainer disabled={disabled}>
          {disabled && (
            <div className='shadow-md absolute top-14 -right-12 transform rotate-45 px-12 bg-pt-teal text-pt-purple font-bold'>
              COMING SOON
            </div>
          )}
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

const ListItemContainer: React.FC<{ disabled: boolean }> = (props) => (
  <li
    {...props}
    className={classNames(
      'p-6 xs:px-24 sm:px-32 rounded-xl flex flex-col items-center overflow-hidden transition relative',
      {
        'opacity-50': props.disabled,
        'hover:opacity-90': !props.disabled
      }
    )}
    style={{ backgroundColor: '#411D89' }}
  />
)
