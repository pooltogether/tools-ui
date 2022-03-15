import { SquareButton, SquareButtonTheme, ThemedClipSpinner } from '@pooltogether/react-components'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import METAMASK_ICON_URL from '../../assets/images/metamask.png'
import classNames from 'classnames'
import { Connector, defaultChains, useConnect } from 'wagmi'

import { CONNECTORS, metaMask } from '../../connectors'
import { getPriorityConnector } from '@web3-react/core'

export const WalletConnectionList: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [{ data, error }, connect] = useConnect()
  const connectors = data?.connectors

  const connectWallet = async (connector: Connector) => {
    try {
      await connect(connector)
    } catch (e) {
      console.error('Error connecting to wallet')
    }
  }

  return (
    <ul className={classNames('flex flex-col space-y-2', className)}>
      {connectors.map((connector) => (
        <WalletConnectionButton
          key={connector.id}
          connector={connector}
          connectWallet={() => connectWallet(connector)}
        />
      ))}
    </ul>
  )
}

interface WalletConnectionOptionProps {
  connector: Connector
  connectWallet: () => void
}

const WalletConnectionOption: React.FC<WalletConnectionOptionProps> = (props) => {
  // const { connector } = props

  // const isMetamask = getIsMetaMask()
  // if (!mobile && isMobile) return null
  // if (mobileOnly && !isMobile) return null

  // if (connector === metaMask) {
  //   if (!(window.web3 || window.ethereum)) {
  //     if (name === 'MetaMask') {
  //       return (
  //         <WalletConnectionButton
  //           walletKey=''
  //           wallet={{
  //             name: 'Install MetaMask',
  //             iconURL: METAMASK_ICON_URL,
  //             description: 'Install MetaMask wallet.',
  //             href: 'https://metamask.io/',
  //             color: '#E8831D'
  //           }}
  //           activate={() => null}
  //         />
  //       )
  //     } else {
  //       return null
  //     }
  //   }
  //   // don't return metamask if injected provider isn't metamask
  //   else if (name === 'MetaMask' && !isMetamask) {
  //     return null
  //   }
  //   // likewise for generic
  //   else if (name === 'Injected' && isMetamask) {
  //     return null
  //   }
  // }

  return <WalletConnectionButton {...props} />
}

const getIsMetaMask = () => window.ethereum && window.ethereum.isMetaMask

interface WalletConnectionButtonProps extends WalletConnectionOptionProps {}

const WalletConnectionButton: React.FC<WalletConnectionButtonProps> = (props) => {
  const { connector, connectWallet } = props
  const { id, name, ready } = connector

  const button = (
    <SquareButton
      noCenter
      onClick={connectWallet}
      className={classNames('w-full flex justify-start items-center')}
      theme={SquareButtonTheme.tealOutline}
      disabled={!ready}
    >
      <span>{name}</span>
    </SquareButton>
  )
  // if (href) {
  //   return (
  //     <a className='w-full' href={href} target='_blank' rel='noreferrer'>
  //       {button}
  //     </a>
  //   )
  // }
  return button
}
