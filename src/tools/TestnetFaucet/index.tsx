import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { TokenFaucetDescription } from './TokenFaucetDescription'
import { TokenFaucetList } from './TokenFaucetList'
import { TokenFaucetSettings } from './TokenFaucetSettings'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { LoadingScreen } from '@pooltogether/react-components'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const TestnetFaucet = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title='Token Faucet' />
          <TokenFaucetDescription className='mb-8' />
          <TokenFaucetSettings className='mb-4' />
          <TokenFaucetList />
          {/* <GenericTokenClaim /> */}
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
