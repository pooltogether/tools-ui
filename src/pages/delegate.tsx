import { LoadingScreen } from '@components/LoadingScreen'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NextPage } from 'next/types'

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
