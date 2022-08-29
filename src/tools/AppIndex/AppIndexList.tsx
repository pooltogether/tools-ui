import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import classNames from 'classnames'

import { DiceSvg, GiftSvg, VoteSvg, GraphSvg } from '@components/SvgComponents'
import { useIsTestnets } from '@pooltogether/hooks'

interface AppInfo {
  titleKey: string
  descriptionKey: string
  href: string
  icon?: any
  emoji?: any
  iconClasses?: string
  testnet?: boolean
  disabled?: boolean
}

const APPS_TO_LIST: AppInfo[] = [
  {
    titleKey: 'depositDelegator',
    descriptionKey: 'depositDelegatorDescription',
    href: 'delegate',
    icon: DiceSvg
  },
  {
    titleKey: 'promotionalRewards',
    descriptionKey: 'promotionalRewardsDescription',
    href: 'promotional-rewards',
    icon: GiftSvg
  },
  {
    titleKey: 'pooltogetherGovernance',
    descriptionKey: 'pooltogetherGovernanceDescription',
    href: 'https://vote.pooltogether.com',
    icon: VoteSvg,
    iconClasses: 'mt-1 w-6'
  },
  {
    titleKey: 'pooltogetherInfo',
    descriptionKey: 'pooltogetherInfoDescription',
    href: 'https://info.pooltogether.com',
    icon: GraphSvg,
    iconClasses: 'mt-1 w-5'
  },
  {
    titleKey: 'pooltogetherLiquidator',
    descriptionKey: 'pooltogetherLiquidatorDescription',
    href: 'liquidator',
    testnet: true,
    emoji: '🐊',
    iconClasses: 'ml-1'
  },
  {
    titleKey: 'pooltogetherTestnetFaucet',
    descriptionKey: 'pooltogetherTestnetFaucetDescription',
    href: 'testnet-faucet',
    testnet: true,
    emoji: '🚰'
  },
  {
    titleKey: 'pooltogetherAirdrop',
    descriptionKey: 'pooltogetherAirdropDescription',
    href: 'initial-pool-distribution',
    iconClasses: 'ml-1',
    emoji: '🏊‍♂️'
  }
]

/**
 * App list is the list of apps to display in the Tools Index
 * @returns
 */
export const AppIndexList: React.FC = () => {
  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-4'>
      {APPS_TO_LIST.map((appInfo) => (
        <AppLink key={appInfo.href} {...appInfo} />
      ))}
    </ul>
  )
}

const AppLink: React.FC<AppInfo> = (props) => {
  const { titleKey, descriptionKey, disabled, href, icon, emoji, iconClasses, testnet } = props
  const { t } = useTranslation()
  const { isTestnets } = useIsTestnets()

  if (!isTestnets && testnet) return null

  return (
    <ListItemContainer disabled={disabled}>
      <Link href={href}>
        <a
          className={classNames(
            'flex flex-col items-center w-full h-full rounded-xl p-6 xs:px-24 sm:px-32 bg-pt-purple-bright hover:bg-pt-purple transition',
            {
              'opacity-50': props.disabled,
              'pointer-events-none': disabled
            }
          )}
        >
          <div className='mx-auto w-full grid grid-cols-4 xs:grid-cols-1 xs:gap-y-2'>
            <div className='w-12 h-12 p-2 m-auto bg-green rounded-full text-black col-span-1'>
              {icon && <div className={classNames('mx-auto', iconClasses)}>{icon()}</div>}
              {emoji && <div className={classNames('mx-auto text-xl', iconClasses)}>{emoji}</div>}
            </div>
            <div className='col-span-3'>
              <h6 className='text-white font-normal mb-2 text-center'>{t(titleKey)}</h6>
              <p className='text-white text-opacity-70 text-center text-xxs'>{t(descriptionKey)}</p>
            </div>
          </div>
        </a>
      </Link>
    </ListItemContainer>
  )
}

const ListItemContainer: React.FC<{ disabled: boolean }> = (props) => (
  <li {...props} className={classNames('rounded-xl flex flex-col items-center relative')} />
)
