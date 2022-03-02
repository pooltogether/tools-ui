import {
  ProfileAvatar,
  ProfileName,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { getPriorityConnector } from '@web3-react/core'
import React, { useEffect, useState } from 'react'

import { WalletModal } from './WalletModal'
import classNames from 'classnames'
import { CONNECTORS, metaMask, walletConnect, walletLink } from '../../connectors'

interface WalletConnectionProps {
  className?: string
}

const { usePriorityAccount, usePriorityIsActive } = getPriorityConnector(...CONNECTORS)

export const WalletConnection: React.FC<WalletConnectionProps> = (props) => {
  const account = usePriorityAccount()
  const active = usePriorityIsActive()
  const [isOpen, setIsOpen] = useState(false)

  // Connect on page load
  useEffect(() => {
    metaMask.connectEagerly()
    walletConnect.connectEagerly()
    walletLink.connectEagerly()
  }, [])

  let button = (
    <SquareButton
      className={classNames(props.className)}
      onClick={() => setIsOpen(true)}
      size={SquareButtonSize.sm}
      theme={SquareButtonTheme.teal}
    >
      Connect Wallet
    </SquareButton>
  )
  if (active) {
    button = (
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          props.className,
          'flex text-pt-teal hover:text-inverse transition-colors font-semibold items-center space-x-2'
        )}
      >
        <ProfileAvatar usersAddress={account} />
        <span>
          <ProfileName usersAddress={account} />
        </span>
      </button>
    )
  }

  return (
    <>
      {button}
      <WalletModal closeModal={() => setIsOpen(false)} isOpen={isOpen} />
    </>
  )
}
