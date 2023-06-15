import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { Description } from './Description'
import { useConfigWatcher } from './hooks/useConfigWatcher'
import { Settings } from './Settings'
import { SimulationCharts } from './SimulationCharts'
import { SimulationInputs } from './SimulationInputs'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const LiquidatorSimulator: React.FC = () => {
  useConfigWatcher()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding maxWidthClassName='max-w-screen-lg'>
          <PageTitle title='Prize Token Liquidator' />
          <Description className='mb-8' />
          <Settings className='mb-4' />
          <div className='grid grid-cols-1 gap-12'>
            <SimulationInputs />
            <SimulationCharts />
          </div>
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
