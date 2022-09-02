import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const TokenFaucet = dynamic(() => import('../tools/TokenFaucet').then((mod) => mod.TokenFaucet), {
  loading: () => <LoadingScreen />
})

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Token Faucet - PoolTogether</title>
        <meta name='description' content='Claim tokens from legacy token faucets' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <TokenFaucet />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
