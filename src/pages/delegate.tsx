import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const TwabDelegator = dynamic(
  () => import('../views/TwabDelegator').then((mod) => mod.TwabDelegator),
  {
    loading: () => <LoadingScreen />
  }
)

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Delegate - PoolTogether</title>
        <meta name='description' content='Manage your deposit delegations.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <TwabDelegator />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
