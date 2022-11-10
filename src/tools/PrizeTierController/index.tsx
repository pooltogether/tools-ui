import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { Actions } from '@prizeTierController/Actions'
import { EditPrizeTiersModal } from '@prizeTierController/EditPrizeTiersModal'
import { PrizeTierHistoryList } from '@prizeTierController/PrizeTierHistoryList'
import { DelegationList } from '@twabDelegator/DelegationList'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic.js'
import { useEffect } from 'react'
import { Suspense } from 'react'
import { prizeTierControllerChainIdAtom, setPrizeTierControllerChainAtom } from './atoms'
import { PrizeTierControllerDescription } from './PrizeTierControllerDescription'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const PrizeTierController: React.FC = () => {
  const [chainId] = useAtom(prizeTierControllerChainIdAtom)
  const setChainId = useUpdateAtom(setPrizeTierControllerChainAtom)
  const usersAddress = useUsersAddress()
  // const [delegator] = useAtom(delegatorAtom)
  // const setDelegator = useUpdateAtom(setDelegatorAtom)
  const { t } = useTranslation()

  // Lazy way to get the app to react on wallet connection
  // useEffect(() => {
  //   if (!delegator) {
  //     setDelegator(usersAddress)
  //   }
  // }, [usersAddress])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('prizeTierController')} />
          <PrizeTierControllerDescription className='mb-8' />
          <Actions className='mb-4' />
          <PrizeTierHistoryList className='mb-8' />
          <EditPrizeTiersModal />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
