import { SquareButton, SquareButtonTheme, ThemedClipSpinner } from '@pooltogether/react-components'
import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'
import METAMASK_ICON_URL from '../../assets/images/metamask.png'
import classNames from 'classnames'

import { SUPPORTED_WALLETS, WalletInfo } from '@constants/wallets'
import { CONNECTORS, metaMask } from '../../connectors'
import { getPriorityConnector } from '@web3-react/core'

export const WalletConnectionList: FC = () => {
  const activateWalletConnection = async (wallet: WalletInfo) => {
    try {
      console.log({ wallet })
      await wallet.connector.activate()
    } catch (e) {
      console.error('Error connecting to wallet')
    }
  }

  return (
    <ul className='flex flex-col space-y-2'>
      {Object.keys(SUPPORTED_WALLETS).map((walletKey) => (
        <WalletConnectionOption
          key={walletKey}
          walletKey={walletKey}
          wallet={SUPPORTED_WALLETS[walletKey]}
          activate={() => activateWalletConnection(SUPPORTED_WALLETS[walletKey])}
        />
      ))}
    </ul>
  )
}

interface WalletConnectionOptionProps {
  walletKey: string
  wallet: WalletInfo
  activate: () => void
}

const WalletConnectionOption: React.FC<WalletConnectionOptionProps> = (props) => {
  const { activate, walletKey, wallet } = props
  const { connector, name, iconURL, description, href, color, primary, mobile, mobileOnly } = wallet

  const isMetamask = getIsMetaMask()
  if (!mobile && isMobile) return null
  if (mobileOnly && !isMobile) return null

  if (connector === metaMask) {
    if (!(window.web3 || window.ethereum)) {
      if (name === 'MetaMask') {
        return (
          <WalletConnectionButton
            walletKey=''
            wallet={{
              name: 'Install MetaMask',
              iconURL: METAMASK_ICON_URL,
              description: 'Install MetaMask wallet.',
              href: 'https://metamask.io/',
              color: '#E8831D'
            }}
            activate={() => null}
          />
        )
      } else {
        return null
      }
    }
    // don't return metamask if injected provider isn't metamask
    else if (name === 'MetaMask' && !isMetamask) {
      return null
    }
    // likewise for generic
    else if (name === 'Injected' && isMetamask) {
      return null
    }
  }

  return <WalletConnectionButton {...props} />
}

const getIsMetaMask = () => window.ethereum && window.ethereum.isMetaMask

interface WalletConnectionButtonProps extends WalletConnectionOptionProps {}

const { usePriorityIsActivating, useSelectedIsActivating } = getPriorityConnector(...CONNECTORS)

const WalletConnectionButton: React.FC<WalletConnectionButtonProps> = (props) => {
  const { activate, walletKey, wallet } = props
  const { connector, name, iconURL, description, href, color, primary, mobile, mobileOnly } = wallet
  const isActivating = useSelectedIsActivating(connector)

  console.log({
    name,
    connector,
    isActivating
  })

  const button = (
    <SquareButton
      noCenter
      onClick={activate}
      className={classNames('w-full flex justify-start items-center')}
      theme={SquareButtonTheme.tealOutline}
      disabled={isActivating}
    >
      <img className='w-8 h-8 mx-6' src={iconURL.src} />
      <span>{name}</span>
      {isActivating && <ThemedClipSpinner className='ml-4' />}
    </SquareButton>
  )
  if (href) {
    return (
      <a className='w-full' href={href} target='_blank' rel='noopener noreferrer'>
        {button}
      </a>
    )
  }
  return button
}
