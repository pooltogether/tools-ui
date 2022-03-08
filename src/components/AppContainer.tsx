import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useTranslation } from 'react-i18next'
import { isMobile } from 'react-device-detect'

import {
  LoadingLogo,
  ThemeContext,
  ThemeContextProvider,
  ToastContainer
} from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import {
  initProviderApiKeys,
  ScreenSize,
  useInitCookieOptions,
  useInitReducedMotion,
  useScreenSize
} from '@pooltogether/hooks'
import { useInitializeOnboard } from '@pooltogether/bnc-onboard-hooks'
import { initSentry, sentryLog } from '../services/sentry'
import { CUSTOM_WALLETS_CONFIG } from '../constants/customWalletsConfig'

// Initialize Localization
import '../services/i18n'
import { ToastContainerProps } from 'react-toastify'
import { useContext } from 'react'

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
        <ThemeContextProvider>
          <ThemedToastContainer />
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

const ThemedToastContainer: React.FC<ToastContainerProps> = (props) => {
  const { theme } = useContext(ThemeContext)
  const screenSize = useScreenSize()
  return (
    <ToastContainer
      {...props}
      style={{ zIndex: '99999' }}
      position={screenSize > ScreenSize.sm ? 'bottom-right' : 'top-center'}
      autoClose={7000}
      theme={theme}
    />
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
