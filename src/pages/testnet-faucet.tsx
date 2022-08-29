import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const TestnetFaucet = dynamic(
  () => import('../tools/TestnetFaucet').then((mod) => mod.TestnetFaucet),
  {
    loading: () => <LoadingScreen />
  }
)

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Token Faucet - PoolTogether</title>
        <meta name='description' content='Get tokens for testnet prize pools.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <TestnetFaucet />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
