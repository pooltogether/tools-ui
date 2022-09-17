import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { NextPage } from 'next/types'
import nextI18NextConfig from '../../next-i18next.config.js'
import { AirdropClaim } from '../tools/AirdropClaim'

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
        <title>Claim POOL - PoolTogether</title>
        <meta name='description' content='Claim POOL from the initial merkle tree distribution.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <AirdropClaim />
    </>
  )
}

export default Home
