import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { PromotionsList } from '@twabRewards/PromotionsList'
import { RewardsTitle } from '@twabRewards/RewardsTitle'
import { UsersAppState } from '@twabRewards/UsersAppState'
import FeatherIcon from 'feather-icons-react'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic.js'
import { useEffect } from 'react'
import { Suspense } from 'react'
import {
  rewardsChainIdAtom,
  currentAccountAtom,
  setRewardsChainAtom,
  setCurrentAccountAtom
} from './atoms'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const TwabRewards: React.FC = () => {
  const [chainId] = useAtom(rewardsChainIdAtom)
  const setChainId = useUpdateAtom(setRewardsChainAtom)
  const usersAddress = useUsersAddress()
  const [currentAccount] = useAtom(currentAccountAtom)
  const setCurrentAccount = useUpdateAtom(setCurrentAccountAtom)

  // Lazy way to get the app to react on wallet connection
  useEffect(() => {
    if (!currentAccount) {
      setCurrentAccount(usersAddress)
    }
  }, [usersAddress])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title='Promotional Rewards' />
          <ClaimingRewardsWarning />
          <RewardsTitle className='mb-8' />
          <UsersAppState
            chainId={chainId}
            currentAccount={currentAccount}
            setCurrentAccount={setCurrentAccount}
            setChainId={setChainId}
            className='mb-8'
          />
          <PromotionsList
            currentAccount={currentAccount}
            chainId={chainId}
            setCurrentAccount={setCurrentAccount}
          />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}

const ClaimingRewardsWarning = () => {
  const { t } = useTranslation()
  return (
    <div className='flex py-2 px-4 items-center space-x-4 border border-orange rounded mt-2 mb-6 font-bold'>
      <FeatherIcon icon='alert-triangle' className='w-6 h-6 text-orange' />
      <span>
        {t('noInterfaceForClaiming', 'There is no interface for claiming promotions at this time.')}
      </span>
    </div>
  )
}
