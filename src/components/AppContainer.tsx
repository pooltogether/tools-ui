import { Provider as JotaiProvider } from 'jotai'
import { createClient, createStorage, Provider as WagmiProvider } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useTranslation } from 'react-i18next'
import { BaseProvider } from '@ethersproject/providers'
import { LoadingLogo, ThemeContext, ThemeContextProvider } from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import {
  ScreenSize,
  useInitCookieOptions,
  useInitReducedMotion,
  useScreenSize,
  initProviderApiKeys as initProviderApiKeysForHooks
} from '@pooltogether/hooks'
import { initSentry } from '../services/sentry'
import '../services/i18n'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { useContext } from 'react'
import { CHAIN_ID } from '@constants/misc'
import { getSupportedChains } from '@utils/getSupportedChains'
import {
  getReadProvider,
  getRpcUrl,
  getRpcUrls,
  useUpdateStoredPendingTransactions,
  initProviderApiKeys as initProviderApiKeysForWalletConnection
} from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

// Initialize react-query Query Client
const queryClient = new QueryClient()
// Initialize read provider API keys to @pooltogether/hooks
initProviderApiKeysForHooks(RPC_API_KEYS)
// Initialize read provider API keys to @pooltogether/wallet-connection
initProviderApiKeysForWalletConnection(RPC_API_KEYS)
// Initialize Sentry error logging
initSentry()

// Initialize WAGMI wallet connectors
const chains = getSupportedChains()
const connectors = ({ chainId }) => {
  return [
    new MetaMaskConnector({ chains, options: {} }),
    new WalletConnectConnector({
      chains,
      options: {
        chainId: chainId || CHAIN_ID.mainnet,
        rpc: getRpcUrls(
          chains.map((chain) => chain.id),
          RPC_API_KEYS
        ),
        bridge: 'https://pooltogether.bridge.walletconnect.org/',
        qrcode: true
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'PoolTogether',
        jsonRpcUrl: getRpcUrl(chainId || CHAIN_ID.mainnet, RPC_API_KEYS)
      }
    }),
    new InjectedConnector({ chains, options: {} })
  ]
}

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider: ({ chainId }) =>
    (chainId
      ? getReadProvider(chainId, RPC_API_KEYS)
      : getReadProvider(CHAIN_ID.mainnet, RPC_API_KEYS)) as BaseProvider
})

/**
 * AppContainer wraps all pages in the app. Used to set up globals.
 * TODO: Add Sentry
 * @param props
 * @returns
 */
export const AppContainer: React.FC = (props) => {
  const { children } = props

  useInitPoolTogetherHooks()
  const { i18n } = useTranslation()

  return (
    <WagmiProvider client={wagmiClient}>
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
    </WagmiProvider>
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
      limit={3}
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
}
