import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const Liquidator = dynamic(() => import('../views/Liquidator').then((mod) => mod.Liquidator), {
  loading: () => <LoadingScreen />
})

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Liquidate Prizes - PoolTogether</title>
        <meta name='description' content='Swap prize tokens for tickets at a discount.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <Liquidator />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
