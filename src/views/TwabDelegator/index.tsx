import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { DelegationList } from '@twabDelegator/DelegationList'
import { DelegationTitle } from '@twabDelegator/DelegationTitle'
import { useEffect, useState } from 'react'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'
import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import { QUERY_PARAM } from './constants'
import { isAddress } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { delegationChainIdAtom } from './atoms'
import { useRouter } from 'next/router'

export const TwabDelegator: React.FC = (props) => {
  const { chainId, setChainId } = useDelegationChainId()
  const delegator = useDelegatorAddress()

  return (
    <Layout>
      <PagePadding>
        <DelegationTitle className='mb-8' />
        <UsersDelegationState
          chainId={chainId}
          delegator={delegator}
          setChainId={setChainId}
          className='mb-8'
        />
        <DelegationList delegator={delegator} chainId={chainId} />
      </PagePadding>
    </Layout>
  )
}

/**
 * Only used at top level.
 * @returns
 */
const useDelegatorAddress = () => {
  const usersAddress = useUsersAddress()
  let url
  if (typeof window !== 'undefined') {
    url = new URL(window.location.href)
  } else {
    return usersAddress
  }

  const delegatorQueryParam = url.searchParams.get(QUERY_PARAM.delegator)?.toLowerCase()
  const isValid = isAddress(delegatorQueryParam)
  return isValid ? delegatorQueryParam : usersAddress
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
