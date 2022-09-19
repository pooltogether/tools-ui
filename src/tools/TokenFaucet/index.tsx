import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { setTokenFaucetChainAtom, tokenFaucetChainIdAtom } from './atoms'
import { TokenFaucetDescription } from './TokenFaucetDescription'
import { TokenFaucetList } from './TokenFaucetList'
import { TokenFaucetSettings } from './TokenFaucetSettings'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const TokenFaucet: React.FC = () => {
  const [chainId] = useAtom(tokenFaucetChainIdAtom)
  const setChainId = useUpdateAtom(setTokenFaucetChainAtom)
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('pooltogetherTokenFaucet')} />
          <TokenFaucetDescription className='mb-8' />
          <TokenFaucetSettings className='mb-8' />
          <TokenFaucetList />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
