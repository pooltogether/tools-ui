import { Provider as JotaiProvider } from 'jotai'
import { createClient, WagmiConfig } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useTranslation } from 'react-i18next'
import {
  LoadingLogo,
  ThemeContext,
  ThemeContextProvider,
  ScreenSize,
  useScreenSize
} from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import { useInitCookieOptions } from '@pooltogether/hooks'
import { initSentry } from '../services/sentry'
import '../services/i18n'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { useContext } from 'react'
import { CHAIN_ID } from '@constants/misc'
import { getSupportedChains } from '@utils/getSupportedChains'
import {
  useUpdateStoredPendingTransactions,
  getReadProvider,
  initRpcUrls
} from '@pooltogether/wallet-connection'
import { AppProps } from 'next/app'
import { RPC_URLS } from '@constants/config'

// Initialize react-query Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false
    }
  }
})

// Initialize Sentry error logging
initSentry()

// Initialize global RPC URLs for external packages
initRpcUrls(RPC_URLS)

// Initialize WAGMI wallet connectors
const chains = getSupportedChains()
const connectors = () => {
  return [
    new MetaMaskConnector({ chains, options: {} }),
    new WalletConnectConnector({
      chains,
      options: {
        bridge: 'https://pooltogether.bridge.walletconnect.org/',
        qrcode: true
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'PoolTogether'
      }
    }),
    new InjectedConnector({ chains, options: {} })
  ]
}

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider: ({ chainId }) => getReadProvider(chainId || CHAIN_ID.mainnet)
})

/**
 * AppContainer wraps all pages in the app. Used to set up globals.
 * TODO: Add Sentry
 * @param props
 * @returns
 */
export const AppContainer: React.FC<AppProps> = (props) => {
  const { Component, pageProps } = props

  useInitPoolTogetherHooks()
  const { i18n } = useTranslation()

  return (
    <WagmiConfig client={wagmiClient}>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <ThemeContextProvider>
            <ThemedToastContainer />
            <CustomErrorBoundary>
              {i18n.isInitialized ? (
                <Component {...pageProps} />
              ) : (
                <div className='flex flex-col h-screen absolute top-0 w-screen'>
                  <LoadingLogo className='m-auto' />
                </div>
              )}
            </CustomErrorBoundary>
          </ThemeContextProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </WagmiConfig>
  )
}

const ThemedToastContainer: React.FC<ToastContainerProps> = (props) => {
  // This doesn't quite fit here, it needs to be nested below Jotai though.
  useUpdateStoredPendingTransactions()

  const { theme } = useContext(ThemeContext)
  const screenSize = useScreenSize()
  return (
    <ToastContainer
      {...props}
      // limit={3}
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
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
}
