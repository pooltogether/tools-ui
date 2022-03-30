import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { DelegationList } from '@twabDelegator/DelegationList'
import { DelegationTitle } from '@twabDelegator/DelegationTitle'
import { useEffect } from 'react'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'
import { useAtom } from 'jotai'
import { rewardsChainIdAtom, addressAtom, setRewardsChainAtom, setAddressAtom } from './atoms'
import { useUpdateAtom } from 'jotai/utils'
import { useUsersAddress } from '@pooltogether/wallet-connection'

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const TwabDelegator: React.FC = () => {
  const [chainId] = useAtom(rewardsChainIdAtom)
  const setChainId = useUpdateAtom(setRewardsChainAtom)
  const usersAddress = useUsersAddress()
  // TODO: Consider renaming this to "viewer" or "currentUser"
  const [address] = useAtom(addressAtom)
  const setAddress = useUpdateAtom(setAddressAtom)

  // Lazy way to get the app to react on wallet connection
  useEffect(() => {
    if (!address) {
      setAddress(usersAddress)
    }
  }, [usersAddress])

  return (
    <>
      <h1 className='text-white'>hello</h1>
      <Layout>
        <PagePadding>
          <h1 className='text-white'>hello</h1>
          <PageTitle title='Deposit Delegator' />
          {/* <DelegationTitle className='mb-8' />
        <UsersDelegationState
          chainId={chainId}
          delegator={delegator}
          setDelegator={setDelegator}
          setChainId={setChainId}
          className='mb-8'
        />
        <DelegationList delegator={delegator} chainId={chainId} setDelegator={setDelegator} /> */}
        </PagePadding>
      </Layout>
    </>
  )
}
