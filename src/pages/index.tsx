import type { NextPage } from 'next'
import Head from 'next/head'
import { AppIndex } from '../views/AppIndex'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>PoolTogether App Index</title>
        <meta name='description' content='An index of apps supporting the PoolTogether protocol.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <AppIndex />
      </main>

      <footer></footer>
    </div>
  )
}

export default Home
