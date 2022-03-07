import { SquareButton, BottomSheet, SquareButtonTheme } from '@pooltogether/react-components'
import { getPriorityConnector } from '@web3-react/core'
import classNames from 'classnames'

import React from 'react'
import { Trans } from 'react-i18next'
import { CONNECTORS } from '../../connectors'
import { WalletConnectionList } from './WalletConnectionList'

interface WalletModalProps {
  isOpen: boolean
  closeModal: () => void
}

const { usePriorityConnector, usePriorityAccount, usePriorityChainId, usePriorityIsActive } =
  getPriorityConnector(...CONNECTORS)

export const WalletModal: React.FC<WalletModalProps> = (props) => {
  const { isOpen, closeModal } = props
  const active = usePriorityIsActive()

  return (
    <BottomSheet label='wallet-connection-modal' open={isOpen} onDismiss={closeModal}>
      {active && <ActiveWalletState />}
      {!active && <ConnectWalletState />}
    </BottomSheet>
  )
}

const ActiveWalletState = () => {
  const connector = usePriorityConnector()
  const account = usePriorityAccount()
  const chainId = usePriorityChainId()

  return (
    <div className='flex flex-col'>
      <div className='overflow-ellipsis overflow-hidden flex flex-col'>
        <h4 className='mb-1'>Account</h4>
        <span className='text-xs opacity-80 mb-4'>{account}</span>
        <span>Chain: {chainId}</span>
      </div>

      <div className='flex justify-end mt-6'>
        <SquareButton
          onClick={() => {
            try {
              connector.deactivate()
            } catch (e) {
              console.debug(e.message)
              window.location.reload()
            }
          }}
          theme={SquareButtonTheme.orangeOutline}
        >
          Disconnect
        </SquareButton>
      </div>
    </div>
  )
}

const ConnectWalletState = () => {
  return (
    <div>
      <h4 className='mb-4'>Connect to a wallet</h4>
      <p className='mb-8'>
        <Trans
          i18nKey='connectWalletTermsAndDisclaimerBlurb'
          components={{
            termsLink: (
              <a
                className='text-pt-teal transition hover:opacity-70'
                href='https://pooltogether.com/terms/'
                target='_blank'
              />
            ),
            disclaimerLink: (
              <a
                className='text-pt-teal transition hover:opacity-70'
                href='https://pooltogether.com/protocol-disclaimer/'
                target='_blank'
              />
            )
          }}
        />
      </p>
      <WalletConnectionList />
    </div>
  )
}

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  color?: string
  darkColor?: string
  size?: string
  transparent?: boolean
  noPad?: boolean
}

const Button = (props: ButtonProps) => {
  const {
    noPad,
    color,
    size,
    transparent,
    className,
    children,
    darkColor: _darkColor,
    ...buttonProps
  } = props

  // Set dark mode colors
  let darkColor = _darkColor
  if (color && !darkColor) {
    darkColor = color
  }

  return (
    <button
      {...buttonProps}
      className={classNames(
        'flex items-center justify-center cursor-pointer rounded-lg transition-all',
        `text-${color}-500 hover:text-${color}-600 active:text-${color}-200`,
        `dark:text-${darkColor}-500 dark:hover:text-${darkColor}-600 dark:active:text-${darkColor}-200`,
        `text-${size}`,
        `border border-${color}-300 hover:border-${color}-400 active:border-${color}-500`,
        `dark:border-${darkColor}-300 dark:hover:border-${darkColor}-400 dark:active:border-${darkColor}-500`,
        {
          'py-2 px-4': !noPad,
          [`bg-${color}-300 hover:bg-${color}-400 active:bg-${color}-500`]: !transparent,
          [`dark:bg-${darkColor}-300 dark:hover:bg-${darkColor}-400 dark:active:bg-${darkColor}-500`]:
            !transparent,
          'bg-transparent': transparent
        },
        className
      )}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  type: 'button',
  color: 'green',
  size: 'md',
  transparent: false,
  noPad: false
}
