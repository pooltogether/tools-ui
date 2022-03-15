import { Provider as JotaiProvider } from 'jotai'
import { Provider as WagmiProvider, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useTranslation } from 'react-i18next'
import { BaseProvider } from '@ethersproject/providers'

import { LoadingLogo, ThemeContext, ThemeContextProvider } from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import {
  APP_ENVIRONMENTS,
  getStoredIsTestnetsCookie,
  initProviderApiKeys,
  ScreenSize,
  useInitCookieOptions,
  useInitReducedMotion,
  useScreenSize
} from '@pooltogether/hooks'
import { initSentry } from '../services/sentry'

// Initialize Localization
import '../services/i18n'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { useContext } from 'react'
import { getReadProvider, getRpcUrl, getRpcUrls } from '@pooltogether/utilities'
import { SUPPORTED_CHAINS } from '@constants/config'
import { CHAIN_ID } from '@constants/misc'

// Initialize Sentry error logging
initSentry()

const RPC_API_KEYS = {
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  infura: process.env.NEXT_PUBLIC_INFURA_ID
}

// Initialize to testnet or mainnet
// Relies on a full refresh when switching state
const isTestnets = getStoredIsTestnetsCookie()
const appEnv = isTestnets ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets

// Initialize read provider API keys
initProviderApiKeys(RPC_API_KEYS)

// Initialize WAGMI wallet connectors
const chains = SUPPORTED_CHAINS[appEnv]
const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({ chains, options: {} }),
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
    new WalletLinkConnector({
      chains,
      options: {
        appName: 'PoolTogether',
        jsonRpcUrl: getRpcUrl(chainId || CHAIN_ID.mainnet, RPC_API_KEYS)
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
    <WagmiProvider
      autoConnect
      connectorStorageKey='pooltogether-wallet'
      connectors={connectors}
      provider={({ chainId }) =>
        (chainId ? getReadProvider(chainId) : getReadProvider(CHAIN_ID.mainnet)) as BaseProvider
      }
    >
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
