import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import { Actions } from '@prizeTierController/Actions'
import { EditPrizeTiersModal } from '@prizeTierController/EditPrizeTiersModal'
import { SavePrizeTiersModal } from '@prizeTierController/SavePrizeTiersModal'
import { PrizeTierHistoryList } from '@prizeTierController/PrizeTierHistoryList'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { PrizeTierControllerDescription } from './PrizeTierControllerDescription'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const PrizeTierController: React.FC = () => {
  const { t } = useTranslation()

  // TODO: user should be able to expand and collapse all prize pool items' info

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('prizeTierController')} />
          <PrizeTierControllerDescription className='mb-8' />
          <Actions className='mb-4' />
          <PrizeTierHistoryList className='mb-8' />
          <EditPrizeTiersModal />
          <SavePrizeTiersModal />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
