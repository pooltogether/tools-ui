import { TokenFaucet } from '@tokenFaucet/index'
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
        <title>Token Faucet - PoolTogether</title>
        <meta name='description' content='Claim tokens from legacy token faucets' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <TokenFaucet />
    </>
  )
}

export default Home
