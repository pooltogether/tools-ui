import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { setTokenFaucetChainAtom, tokenFaucetChainIdAtom } from './atoms'
import { TokenFaucetDescription } from './TokenFaucetDescription'
import { TokenFaucetSettings } from './TokenFaucetSettings'
import { TokenFaucetList } from './TokenFaucetList'

export const TokenFaucet: React.FC = () => {
  const [chainId] = useAtom(tokenFaucetChainIdAtom)
  const setChainId = useUpdateAtom(setTokenFaucetChainAtom)
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  return (
    <Layout>
      <PagePadding>
        <PageTitle title={t('pooltogetherTokenFaucet')} />
        <TokenFaucetDescription className='mb-8' />
        <TokenFaucetSettings className='mb-8' />
        <TokenFaucetList />
      </PagePadding>
    </Layout>
  )
}
