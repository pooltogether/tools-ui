import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const TwabRewards = dynamic(() => import('../views/TwabRewards').then((mod) => mod.TwabDelegator), {
  loading: () => <LoadingScreen />
})

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Promo - PoolTogether</title>
        <meta name='description' content='Create and manage promotional reward campaigns.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <TwabRewards />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
