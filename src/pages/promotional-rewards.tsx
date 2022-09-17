import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { NextPage } from 'next/types'
import nextI18NextConfig from '../../next-i18next.config.js'
import { TwabRewards } from '../tools/TwabRewards'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
    }
  }
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Promotional Rewards - PoolTogether</title>
        <meta name='description' content='Create and manage promotional reward campaigns.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <TwabRewards />
    </>
  )
}

export default Home
