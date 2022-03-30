import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import classNames from 'classnames'

import { DiceSvg, GiftSvg, VoteSvg, GraphSvg } from '@components/SvgComponents'

interface AppInfo {
  titleKey: string
  descriptionKey: string
  href: string
  icon: any
  iconClasses?: string
  disabled?: boolean
}

const APPS_TO_LIST: AppInfo[] = [
  {
    titleKey: 'Deposit Delegator',
    descriptionKey: 'Delegate your chances to win without losing custody of your deposit.',
    href: 'delegate',
    icon: DiceSvg
  },
  {
    titleKey: 'Promotional Rewards',
    descriptionKey:
      'Reward PoolTogether depositors on specific pools or chains with any ERC20 tokens.',
    href: 'rewards',
    icon: GiftSvg
  },
  {
    titleKey: 'PoolTogether Governance',
    descriptionKey:
      'Create and vote on proposals that control the PoolTogether protocol with POOL.',
    href: 'https://vote.pooltogether.com',
    icon: VoteSvg,
    iconClasses: 'mt-1 w-6'
  },
  {
    titleKey: 'PoolTogether Info',
    descriptionKey: 'Analytics for the PoolTogether protocol.',
    href: 'https://info.pooltogether.com',
    icon: GraphSvg,
    iconClasses: 'mt-1 w-5'
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
  const { titleKey, descriptionKey, disabled, href, icon, iconClasses } = props
  const { t } = useTranslation()

  return (
    <ListItemContainer disabled={disabled}>
      <Link href={href}>
        <a
          className={classNames(
            'flex flex-col items-center w-full p-6 xs:px-24 sm:px-32 bg-pt-purple-bright hover:bg-pt-purple transition',
            {
              'opacity-50': props.disabled,
              'pointer-events-none': disabled
            }
          )}
        >
          <div className='w-12 h-12 mx-6 p-2 mb-2 bg-green rounded-full text-black'>
            <div className={classNames('mx-auto', iconClasses)}>{icon()}</div>
          </div>
          <h6 className='text-white font-normal mb-2'>{t(titleKey)}</h6>
          <p className='text-white text-opacity-70 text-center text-xxs'>{descriptionKey}</p>
        </a>
      </Link>
    </ListItemContainer>
  )
}

const ListItemContainer: React.FC<{ disabled: boolean }> = (props) => (
  <li
    {...props}
    className={classNames('rounded-xl flex flex-col items-center overflow-hidden relative')}
  />
)
