import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import {} from '@web3-react/core'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'

import { LoadingLogo, ThemeContextProvider, ToastContainer } from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import {
  initProviderApiKeys,
  useInitCookieOptions,
  useInitReducedMotion
} from '@pooltogether/hooks'
import { useInitializeOnboard } from '@pooltogether/bnc-onboard-hooks'
import { initSentry, sentryLog } from '../services/sentry'
import { CUSTOM_WALLETS_CONFIG } from '../constants/customWalletsConfig'

// Initialize Localization
import '../services/i18n'

// Initialize Sentry error logging
initSentry()

// Initialize read provider API keys
initProviderApiKeys({
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  infura: process.env.NEXT_PUBLIC_INFURA_ID
})

// Initialize react-query Query Client
const queryClient = new QueryClient()

/**
 * AppContainer wraps all pages in the app. Used to set up globals.
 * @param props
 * @returns
 */
export const AppContainer: React.FC = (props) => {
  const { children } = props

  useInitPoolTogetherHooks()
  const { i18n } = useTranslation()

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <ToastContainer className='pool-toast' position='top-center' autoClose={7000} />
        <ThemeContextProvider>
          <CustomErrorBoundary>
            {i18n.isInitialized ? (
              <>{children}</>
            ) : (
              <div className='flex flex-col h-screen absolute top-0 w-screen'>
                <LoadingLogo className='m-auto' />
              </div>
            )}
          </CustomErrorBoundary>
        </ThemeContextProvider>
      </QueryClientProvider>
    </JotaiProvider>
  )
}

/**
 * Initializes PoolTogether tooling global state
 */
const useInitPoolTogetherHooks = () => {
  useInitReducedMotion(Boolean(process.env.NEXT_PUBLIC_REDUCE_MOTION))
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
  useInitializeOnboard({
    infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    fortmaticKey: process.env.NEXT_PUBLIC_FORTMATIC_API_KEY,
    portisKey: process.env.NEXT_PUBLIC_PORTIS_API_KEY,
    defaultNetworkName: 'homestead',
    customWalletsConfig: CUSTOM_WALLETS_CONFIG,
    sentryLog
  })
}
