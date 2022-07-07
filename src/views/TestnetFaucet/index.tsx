import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { TokenFaucetDescription } from './TokenFaucetDescription'
import { TokenFaucetList } from './TokenFaucetList'
import { TokenFaucetSettings } from './TokenFaucetSettings'

export const TestnetFaucet = () => {
  return (
    <Layout>
      <PagePadding>
        <PageTitle title='Token Faucet' />
        <TokenFaucetDescription className='mb-8' />
        <TokenFaucetSettings className='mb-4' />
        <TokenFaucetList />
        {/* <GenericTokenClaim /> */}
      </PagePadding>
    </Layout>
  )
}
