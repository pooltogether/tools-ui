import { RPC_URLS } from '@constants/config'
import { CHAIN_ID } from '@constants/misc'
import { useInitCookieOptions } from '@pooltogether/hooks'
import { ScreenSize, useScreenSize, LoadingScreen } from '@pooltogether/react-components'
import {
  useUpdateStoredPendingTransactions,
  getReadProvider,
  initRpcUrls
} from '@pooltogether/wallet-connection'
import { getSupportedChains } from '@utils/getSupportedChains'
import { ApexConnector } from 'apex-integration'
import * as Fathom from 'fathom-client'
import { Provider as JotaiProvider } from 'jotai'
import { useTranslation } from 'next-i18next'
import { ThemeProvider, useTheme } from 'next-themes'
import { AppProps } from 'next/app'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { createClient, useAccount, useConnect, WagmiConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { initSentry } from '../services/sentry'
import { CustomErrorBoundary } from './CustomErrorBoundary'
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
// initSentry()

// Initialize global RPC URLs for external packages
initRpcUrls(RPC_URLS)

// Initialize WAGMI wallet connectors
const chains = getSupportedChains().map((chain) => {
  // console.log(chain)
  if (!!RPC_URLS[chain.id]) {
    chain.rpcUrls.default = RPC_URLS[chain.id]
  }
  return chain
})
const connectors = () => {
  return [
    new ApexConnector({ chains, options: {} }),
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
  provider: ({ chainId }) => {
    try {
      return getReadProvider(chainId || CHAIN_ID.mainnet)
    } catch (e) {
      console.error(e)
      return getReadProvider(CHAIN_ID.mainnet)
    }
  }
})

/**
 * AppContainer wraps all pages in the app. Used to set up globals.
 * TODO: Add Sentry
 * @param props
 * @returns
 */
export const AppContainer: React.FC<AppProps> = (props) => {
  const { router } = props

  useEffect(() => {
    const fathomSiteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID
    if (fathomSiteId) {
      Fathom.load(process.env.NEXT_PUBLIC_FATHOM_SITE_ID, {
        url: 'https://goose.pooltogether.com/script.js',
        includedDomains: ['app.pooltogether.com', 'v4.pooltogether.com']
      })
      const onRouteChangeComplete = (url) => {
        if (window['fathom']) {
          window['fathom'].trackPageview()
        }
      }
      router.events.on('routeChangeComplete', onRouteChangeComplete)
      return () => {
        router.events.off('routeChangeComplete', onRouteChangeComplete)
      }
    }
  }, [])

  return (
    <WagmiConfig client={wagmiClient}>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <ThemeProvider attribute='class' defaultTheme='dark'>
            <ThemedToastContainer />
            <CustomErrorBoundary>
              <Content {...props} />
            </CustomErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </WagmiConfig>
  )
}

const Content: React.FC<AppProps> = (props) => {
  const { Component, pageProps } = props
  const isInitialized = useInitialLoad()

  if (!isInitialized) {
    return <LoadingScreen />
  }
  return <Component {...pageProps} />
}

const useInitialLoad = () => {
  const { i18n } = useTranslation()
  useUpdateStoredPendingTransactions()
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
  const { status } = useAccount()
  return !!i18n.isInitialized && status !== 'reconnecting'
}

const ThemedToastContainer: React.FC<ToastContainerProps> = (props) => {
  const { theme, systemTheme } = useTheme()
  const screenSize = useScreenSize()
  return (
    <ToastContainer
      {...props}
      style={{ zIndex: '99999' }}
      position={screenSize > ScreenSize.sm ? 'bottom-right' : 'top-center'}
      autoClose={7000}
      theme={theme === 'system' ? systemTheme : (theme as 'dark' | 'light')}
    />
  )
}
