import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const AirdropClaim = dynamic(
  () => import('../tools/AirdropClaim').then((mod) => mod.AirdropClaim),
  {
    loading: () => <LoadingScreen />
  }
)

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Liquidate Prizes - PoolTogether</title>
        <meta name='description' content='Claim POOL from the initial merkle tree distribution.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <AirdropClaim />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
