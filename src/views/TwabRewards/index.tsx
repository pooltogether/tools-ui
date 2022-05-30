import Layout from '@components/Layout'
import FeatherIcon from 'feather-icons-react'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { PromotionsList } from '@twabRewards/PromotionsList'
import { RewardsTitle } from '@twabRewards/RewardsTitle'
import { useEffect } from 'react'
import { UsersAppState } from '@twabRewards/UsersAppState'
import { useAtom } from 'jotai'
import {
  rewardsChainIdAtom,
  currentAccountAtom,
  setRewardsChainAtom,
  setCurrentAccountAtom
} from './atoms'
import { useUpdateAtom } from 'jotai/utils'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'

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
