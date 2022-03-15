import { SquareButton, SquareButtonTheme, WalletIcon } from '@pooltogether/react-components'
import React from 'react'
import classNames from 'classnames'
import { Connector, useConnect } from 'wagmi'

export const WalletConnectionList: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [{ data }, connect] = useConnect()
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

interface WalletConnectionButtonProps {
  connector: Connector
  connectWallet: () => void
}

const WalletConnectionButton: React.FC<WalletConnectionButtonProps> = (props) => {
  const { connector, connectWallet } = props
  const { name, ready } = connector

  console.log({ connector })

  if (!ready) return null

  return (
    <li>
      <SquareButton
        noCenter
        onClick={connectWallet}
        className={classNames('w-full flex justify-start items-center space-x-4')}
        theme={SquareButtonTheme.tealOutline}
      >
        <WalletIcon wallet={name.toLowerCase()} className='ml-4' sizeClassName='w-6 h-6' />
        <span>{name}</span>
      </SquareButton>
    </li>
  )
}
