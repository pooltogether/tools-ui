import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import { Actions } from '@prizeTierController/Actions'
import { SelectedView, selectedView } from '@prizeTierController/atoms'
import { ConfigurationView } from '@prizeTierController/ConfigurationView'
import { EditPrizeTiersModal } from '@prizeTierController/EditPrizeTiersModal'
import { PrizeTierControllerDescription } from '@prizeTierController/PrizeTierControllerDescription'
import { ProjectionView } from '@prizeTierController/ProjectionView'
import { SavePrizeTiersModal } from '@prizeTierController/SavePrizeTiersModal'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const PrizeTierController: React.FC = () => {
  const [view] = useAtom(selectedView)
  const { t } = useTranslation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('prizeTierController')} />
          <PrizeTierControllerDescription className='mb-8' />
          <Actions className='mb-4' />
          {view === SelectedView.configuration && <ConfigurationView className='mb-8' />}
          {view === SelectedView.projection && <ProjectionView className='mb-8' />}
          <EditPrizeTiersModal />
          <SavePrizeTiersModal />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
