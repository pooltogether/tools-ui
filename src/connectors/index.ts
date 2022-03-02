import { RPC_URLS } from '@constants/config'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { WalletLink } from '@web3-react/walletlink'

import POOLTOGETHER_LOGO_URL from '../assets/images/pool.svg'

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions)
)

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: RPC_URLS
    }),
  Object.keys(RPC_URLS).map((chainId) => Number(chainId))
)

export const [walletLink, walletLinkHooks] = initializeConnector<WalletLink>(
  (actions) =>
    new WalletLink(actions, {
      url: RPC_URLS[1][0],
      appName: 'web3-react'
    })
)

export const CONNECTORS: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [walletLink, walletLinkHooks]
]
