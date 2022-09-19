import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LiquidatorDescription } from '@liquidator/LiquidatorDescription'
import { LiquidatorSwap } from '@liquidator/LiquidatorSwap'
import { LoadingScreen } from '@pooltogether/react-components'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { LiquidatorSettings } from './LiquidatorSettings'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const Liquidator: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title='Prize Token Liquidator' />
          <LiquidatorDescription className='mb-8' />
          <LiquidatorSettings className='mb-4' />
          <LiquidatorSwap />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
