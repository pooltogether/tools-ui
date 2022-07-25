import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next/types'

import { LoadingScreen } from '@components/LoadingScreen'

const TwabDelegator = dynamic(
  () => import('../../views/TwabDelegator/BulkTwabDelegator').then((mod) => mod.BulkTwabDelegator),
  {
    loading: () => <LoadingScreen />
  }
)

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Bulk Delegate - PoolTogether</title>
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
