import { DiceSvg, GiftSvg, VoteSvg, GraphSvg } from '@components/SvgComponents'
import { useIsTestnets } from '@pooltogether/hooks'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'

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
    emoji: '🤝'
  },
  {
    titleKey: 'promotionalRewards',
    descriptionKey: 'promotionalRewardsDescription',
    href: 'promotional-rewards',
    emoji: '🎁'
  },
  {
    titleKey: 'pooltogetherGovernance',
    descriptionKey: 'pooltogetherGovernanceDescription',
    href: 'https://vote.pooltogether.com',
    emoji: '🗳'
  },
  {
    titleKey: 'pooltogetherInfo',
    descriptionKey: 'pooltogetherInfoDescription',
    href: 'https://info.pooltogether.com',
    emoji: '📊'
  },
  {
    titleKey: 'pooltogetherTokenFaucet',
    descriptionKey: 'pooltogetherTokenFaucetDescription',
    href: 'token-faucet',
    emoji: '🚰'
  },
  {
    titleKey: 'pooltogetherLiquidator',
    descriptionKey: 'pooltogetherLiquidatorDescription',
    href: 'liquidator',
    testnet: true,
    emoji: '🐊'
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
    emoji: '🏊'
  },
  {
    titleKey: 'prizeTierController',
    descriptionKey: 'prizeTierControllerDescription',
    href: 'prize-tier-controller',
    emoji: '🕹'
  },
  {
    titleKey: 'pooltogetherLiquidatorSimulation',
    descriptionKey: 'pooltogetherLiquidatorSimulationDescription',
    href: 'liquidator-simulator',
    testnet: true,
    emoji: '🌊'
  }
]

/**
 * App list is the list of apps to display in the Tools Index
 * @returns
 */
export const AppIndexList: React.FC = () => {
  return (
    <ul className='grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-4'>
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
            'flex flex-col justify-center items-center w-full h-full rounded-xl p-6 xs:px-8 sm:px-32 bg-pt-purple-bright hover:bg-pt-purple transition',
            {
              'opacity-50': props.disabled,
              'pointer-events-none': disabled
            }
          )}
        >
          <div className='mx-auto w-full grid grid-cols-5 xs:grid-cols-1 xs:gap-y-2'>
            <div className='m-auto col-span-1 text-3xl'>{emoji}</div>
            <div className='col-span-4'>
              <h6 className='text-white font-normal mb-2 text-center'>{t(titleKey)}</h6>
              <p className='text-white text-opacity-70 text-center text-xxs'>{t(descriptionKey)}</p>
            </div>
          </div>
        </a>
      </Link>
    </ListItemContainer>
  )
}

const ListItemContainer: React.FC<{ children: React.ReactNode; disabled: boolean }> = (props) => (
  <li
    {...props}
    className={classNames('rounded-xl flex flex-col justify-center items-center relative')}
  />
)
