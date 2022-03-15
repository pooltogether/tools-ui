import { Provider as JotaiProvider } from 'jotai'
import { Provider as WagmiProvider, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useTranslation } from 'react-i18next'

import { LoadingLogo, ThemeContext, ThemeContextProvider } from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import {
  initProviderApiKeys,
  ScreenSize,
  useInitCookieOptions,
  useInitReducedMotion,
  useScreenSize
} from '@pooltogether/hooks'
import { initSentry } from '../services/sentry'

// Initialize Localization
import '../services/i18n'
import { toast, ToastContainer, ToastContainerProps } from 'react-toastify'
import { useContext } from 'react'
import { getRpcUrl, getRpcUrls } from '@pooltogether/utilities'
import { ALL_SUPPORTED_CHAINS } from '@constants/config'

// Initialize Sentry error logging
initSentry()

const RPC_API_KEYS = {
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  infura: process.env.NEXT_PUBLIC_INFURA_ID
}

// Initialize read provider API keys
initProviderApiKeys(RPC_API_KEYS)

console.log({ defaultChains, ALL_SUPPORTED_CHAINS })
// Initialize WAGMI wallet connectors
const connectors = ({ chainId }) => {
  console.log('connectors', { chainId, url: getRpcUrl(chainId, RPC_API_KEYS) })
  return [
    new InjectedConnector({ chains: ALL_SUPPORTED_CHAINS, options: { shimDisconnect: true } }),
    new WalletConnectConnector({
      chains: ALL_SUPPORTED_CHAINS,
      options: {
        chainId,
        rpc: getRpcUrls(
          ALL_SUPPORTED_CHAINS.map((chain) => chain.id),
          RPC_API_KEYS
        ),
        bridge: 'https://pooltogether.bridge.walletconnect.org/',
        qrcode: true
      }
    })
  ]
}

// Initialize react-query Query Client
const queryClient = new QueryClient()

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
    <WagmiProvider autoConnect connectorStorageKey='pooltogether-wallet' connectors={connectors}>
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
