import Layout from '@components/Layout'
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

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const TwabRewards: React.FC = () => {
  const [chainId] = useAtom(rewardsChainIdAtom)
  const setChainId = useUpdateAtom(setRewardsChainAtom)
  const usersAddress = useUsersAddress()
  const [currentAccount] = useAtom(currentAccountAtom)
  const setCurrentAccount = useUpdateAtom(setCurrentAccountAtom)
  console.log({ wtf: currentAccount })

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
