import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { DelegationDescription } from '@twabDelegator/DelegationDescription'
import { DelegationList } from '@twabDelegator/DelegationList'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'
import {
  delegationChainIdAtom,
  delegatorAtom,
  setDelegationChainAtom,
  setDelegatorAtom
} from './atoms'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { LoadingScreen } from '@pooltogether/react-components'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const TwabDelegator: React.FC = () => {
  const [chainId] = useAtom(delegationChainIdAtom)
  const setChainId = useUpdateAtom(setDelegationChainAtom)
  const usersAddress = useUsersAddress()
  const [delegator] = useAtom(delegatorAtom)
  const setDelegator = useUpdateAtom(setDelegatorAtom)
  const { t } = useTranslation()

  // Lazy way to get the app to react on wallet connection
  useEffect(() => {
    if (!delegator) {
      setDelegator(usersAddress)
    }
  }, [usersAddress])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('depositDelegator')} />
          <DelegationDescription className='mb-8' />
          <UsersDelegationState
            chainId={chainId}
            delegator={delegator}
            setDelegator={setDelegator}
            setChainId={setChainId}
            className='mb-8'
          />
          <DelegationList delegator={delegator} chainId={chainId} setDelegator={setDelegator} />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
