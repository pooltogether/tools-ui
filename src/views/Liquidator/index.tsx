import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LiquidatorDescription } from '@liquidator/LiquidatorDescription'
import { LiquidatorSwap } from '@liquidator/LiquidatorSwap'
import { LiquidatorSettings } from './LiquidatorSettings'

export const Liquidator: React.FC = () => {
  return (
    <Layout>
      <PagePadding>
        <PageTitle title='Prize Token Liquidator' />
        <LiquidatorDescription className='mb-8' />
        <LiquidatorSettings className='mb-4' />
        <LiquidatorSwap />
      </PagePadding>
    </Layout>
  )
}
