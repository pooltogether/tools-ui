import Head from 'next/head'
import { NextPage } from 'next/types'

import { TwabRewards } from '../tools/TwabRewards'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Promotional Rewards - PoolTogether</title>
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
