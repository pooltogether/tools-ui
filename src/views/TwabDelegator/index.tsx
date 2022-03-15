import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { DelegationList } from '@twabDelegator/DelegationList'
import { DelegationTitle } from '@twabDelegator/DelegationTitle'
import { useEffect } from 'react'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'
import { QUERY_PARAM } from './constants'
import { useAtom } from 'jotai'
import { delegationChainIdAtom, delegatorAtom, setDelegatorAtom } from './atoms'
import { useRouter } from 'next/router'
import { useUpdateAtom } from 'jotai/utils'
import { useUsersAddress } from '@hooks/wallet/useUsersAddress'

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const TwabDelegator: React.FC = (props) => {
  const { chainId, setChainId } = useDelegationChainId()
  const usersAddress = useUsersAddress()
  const [delegator] = useAtom(delegatorAtom)
  const setDelegator = useUpdateAtom(setDelegatorAtom)

  // Lazy way to get the app to react on wallet connection
  useEffect(() => {
    setDelegator(usersAddress)
  }, [usersAddress])

  return (
    <Layout>
      <PagePadding>
        <PageTitle title='Chance Gifting' />
        <DelegationTitle className='mb-8' />
        <UsersDelegationState
          chainId={chainId}
          delegator={delegator}
          setChainId={setChainId}
          className='mb-8'
        />
        <DelegationList delegator={delegator} chainId={chainId} setDelegator={setDelegator} />
      </PagePadding>
    </Layout>
  )
}

/**
 * Only used at top level. Multiple listeners will cause issues.
 * @returns
 */
const useDelegationChainId = () => {
  const [chainId, setChainId] = useAtom(delegationChainIdAtom)
  // Initialize query param
  useEffect(() => {
    const url = new URL(window.location.href)
    const queryParam = url.searchParams.get(QUERY_PARAM.delegationChainId)
    if (!queryParam) {
      url.searchParams.set(QUERY_PARAM.delegationChainId, chainId.toString())
    }
  }, [])
  const router = useRouter()
  return {
    chainId,
    // Set query param when updating atom
    setChainId: (chainId: number) => {
      const url = new URL(window.location.href)
      url.searchParams.set(QUERY_PARAM.delegationChainId, chainId.toString())
      router.replace(url, null, { scroll: false })
      setChainId(chainId)
    }
  }
}
