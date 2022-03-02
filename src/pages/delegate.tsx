import { TwabDelegator } from '@views/TwabDelegator'
import type { NextPage } from 'next'
import Head from 'next/head'

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
