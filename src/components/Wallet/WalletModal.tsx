import { Transaction, TransactionStatus, useUsersTransactions } from '@atoms/transactions'
import FeatherIcon from 'feather-icons-react'
import { TransactionState } from '@pooltogether/hooks'
import {
  SquareButton,
  BottomSheet,
  SquareButtonTheme,
  BlockExplorerLink,
  SquareButtonSize,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'

import React from 'react'
import { Trans } from 'react-i18next'
import { useAccount, useConnect, useNetwork } from 'wagmi'
import { WalletConnectionList } from './WalletConnectionList'

interface WalletModalProps {
  isOpen: boolean
  closeModal: () => void
}

export const WalletModal: React.FC<WalletModalProps> = (props) => {
  const { isOpen, closeModal } = props
  const [{ data, error, loading }, connect] = useConnect()
  const connected = data?.connected

  return (
    <BottomSheet
      label='wallet-connection-modal'
      open={isOpen}
      onDismiss={closeModal}
      maxWidthClassName='max-w-md'
    >
      {connected && <ActiveWalletState />}
      {!connected && <ConnectWalletState closeModal={closeModal} />}
    </BottomSheet>
  )
}

const ActiveWalletState = () => {
  const [{ data: account }, disconnect] = useAccount()
  const [{ data: network }] = useNetwork()
  const address = account?.address
  const connectorName = account?.connector.name
  const chainId = network?.chain.id
  const transactions = useUsersTransactions(address)
  const filteredTransactions = transactions?.slice(transactions.length - 5).reverse()

  return (
    <div className='flex flex-col px-4 sm:px-0'>
      <h4 className='mb-2'>Account</h4>
      <div className='grid grid-cols-2'>
        <div className='overflow-ellipsis overflow-hidden flex flex-col space-y-1'>
          <BlockExplorerLink className='opacity-80' shorten address={address} chainId={chainId} />
          <span className='opacity-80'>{connectorName}</span>
          <div className='space-x-1 opacity-80'>
            <span>{getNetworkNiceNameByChainId(chainId)}</span>
            <span className='text-xxs opacity-80'>{`(${chainId})`}</span>
          </div>
        </div>
        <div className='flex flex-col justify-end'>
          <SquareButton
            className='w-32 ml-auto'
            size={SquareButtonSize.sm}
            onClick={() => {
              try {
                disconnect()
              } catch (e) {
                console.error(e.message)
                window.location.reload()
              }
            }}
            theme={SquareButtonTheme.orangeOutline}
          >
            Disconnect
          </SquareButton>
        </div>
      </div>
      <hr />
      <h5 className='mb-2'>Past Transactions</h5>
      <ul className='space-y-1'>
        {filteredTransactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </div>
  )
}

const TransactionItem: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props
  return (
    <li key={transaction.id} className='flex space-x-2 items-center'>
      <TransactionStatusIcon transaction={transaction} />
      <BlockExplorerLink chainId={transaction.chainId} txHash={transaction.response.hash}>
        {transaction.transactionName}
      </BlockExplorerLink>
    </li>
  )
}

const TransactionStatusIcon: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props

  if (transaction.state === TransactionState.pending) {
    return <ThemedClipSpinner sizeClassName='w-4 h-4' />
  } else if (
    transaction.status === TransactionStatus.error ||
    transaction.status === TransactionStatus.cancelled
  ) {
    return <FeatherIcon icon='x-circle' className='text-pt-red-light w-4 h-4' />
  } else {
    return <FeatherIcon icon='check-circle' className='text-pt-teal w-4 h-4' />
  }
}

const ConnectWalletState: React.FC<{ closeModal: () => void }> = (props) => {
  return (
    <>
      <h4 className='mb-4'>Connect to a wallet</h4>
      <p className='mb-8'>
        <Trans
          i18nKey='connectWalletTermsAndDisclaimerBlurb'
          components={{
            termsLink: (
              <a
                className='text-pt-teal transition hover:opacity-70 underline'
                href='https://pooltogether.com/terms/'
                target='_blank'
                rel='noreferrer'
              />
            ),
            disclaimerLink: (
              <a
                className='text-pt-teal transition hover:opacity-70 underline'
                href='https://pooltogether.com/protocol-disclaimer/'
                target='_blank'
                rel='noreferrer'
              />
            )
          }}
        />
      </p>
      <WalletConnectionList className='mb-4' closeModal={props.closeModal} />
      <a
        className='text-pt-teal transition hover:opacity-70 underline text-sm'
        href='https://docs.ethhub.io/using-ethereum/wallets/intro-to-ethereum-wallets/'
        target='_blank'
        rel='noreferrer'
      >
        {`What's a wallet?`}
      </a>
    </>
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
