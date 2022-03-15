import {
  ProfileAvatar,
  ProfileName,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import React, { useEffect, useState } from 'react'

import { WalletModal } from './WalletModal'
import classNames from 'classnames'
import { useAccount } from 'wagmi'

interface WalletConnectionProps {
  className?: string
}

export const WagmiWalletConnection: React.FC<WalletConnectionProps> = (props) => {
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true
  })
  const [isOpen, setIsOpen] = useState(false)

  let button = (
    <SquareButton
      className={classNames(props.className)}
      onClick={() => setIsOpen(true)}
      size={SquareButtonSize.sm}
      theme={SquareButtonTheme.teal}
    >
      WAGMI Connect Wallet
    </SquareButton>
  )
  if (accountData) {
    button = (
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          props.className,
          'flex text-pt-teal hover:text-inverse transition-colors font-semibold items-center space-x-2'
        )}
      >
        <ProfileAvatar usersAddress={accountData.address} />
        <span>
          <ProfileName usersAddress={accountData.address} />
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
