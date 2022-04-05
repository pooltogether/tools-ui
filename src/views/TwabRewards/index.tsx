import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
// import { RewardsList } from '@twabRewards/RewardsList'
import { RewardsTitle } from '@twabRewards/RewardsTitle'
import { useEffect } from 'react'
import { UsersRewardsState } from '@twabRewards/UsersRewardsState'
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
  const [address] = useAtom(currentAccountAtom)
  const setCurrentAccount = useUpdateAtom(setCurrentAccountAtom)

  // Lazy way to get the app to react on wallet connection
  useEffect(() => {
    if (!address) {
      setCurrentAccount(usersAddress)
    }
  }, [usersAddress])

  return (
    <Layout>
      <PagePadding>
        <PageTitle title='Deposit Rewards' />
        <RewardsTitle className='mb-8' />
        <UsersRewardsState
          chainId={chainId}
          address={address}
          setCurrentAccount={setCurrentAccount}
          setChainId={setChainId}
          className='mb-8'
        />
        {/* <RewardsList delegator={delegator} chainId={chainId} setRewards={setRewards} /> */}
      </PagePadding>
    </Layout>
  )
}
