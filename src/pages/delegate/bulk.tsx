import { BulkTwabDelegator } from '@twabDelegator/BulkTwabDelegator'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { NextPage } from 'next/types'
import nextI18NextConfig from '../../../next-i18next.config.js'

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
        <title>Bulk Delegate - PoolTogether</title>
        <meta name='description' content='Manage your deposit delegations.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BulkTwabDelegator />
    </>
  )
}

export default Home
