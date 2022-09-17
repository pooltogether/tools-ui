import { Liquidator } from '@liquidator/index'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { NextPage } from 'next/types'
import nextI18NextConfig from '../../next-i18next.config.js'

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
        <title>Liquidate Prizes - PoolTogether</title>
        <meta name='description' content='Swap prize tokens for tickets at a discount.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Liquidator />
    </>
  )
}

export default Home
