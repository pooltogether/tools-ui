import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import nextI18NextConfig from '../../next-i18next.config.js'
import { AppIndex } from '../tools/AppIndex'

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
        <title>PoolTogether Tools Index</title>
        <meta name='description' content='A list of apps supporting the PoolTogether protocol.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <AppIndex />
    </>
  )
}

export default Home
