import { useSupportedChains } from '@hooks/app/useSupportedChains'
import { useWalletChainId } from '@hooks/wallet/useWalletChainId'
import { BottomSheet, NetworkIcon, ThemedClipSpinner } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Chain, Connector, useNetwork } from 'wagmi'

interface NetworkSelectionModalProps {
  connector: Connector
  isOpen: boolean
  closeModal: () => void
}

export const NetworkSelectionModal: React.FC<NetworkSelectionModalProps> = (props) => {
  const { isOpen, closeModal, connector } = props
  const chains = useSupportedChains()
  const [{ data: network }, _switchNetwork] = useNetwork()
  const { t } = useTranslation()
  const walletChainId = useWalletChainId()
  const [switchingToNetwork, setSwitchingToNetwork] = useState<number>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const switchNetwork = async (chainId: number) => {
    setErrorMessage(undefined)
    if (walletChainId !== chainId) {
      try {
        setSwitchingToNetwork(chainId)
        const { data, error } = await _switchNetwork(chainId)
        if (error) {
          setErrorMessage(`Error switching to ${getNetworkNiceNameByChainId(chainId)}`)
          setSwitchingToNetwork(undefined)
          return
        }
      } catch (e) {
        console.error(e)
        setErrorMessage(`Error switching to ${getNetworkNiceNameByChainId(chainId)}`)
      }
    }
    setSwitchingToNetwork(undefined)
    closeModal()
  }

  return (
    <BottomSheet
      label='wallet-connection-modal'
      open={isOpen}
      onDismiss={closeModal}
      maxWidthClassName='max-w-md'
    >
      <h6 className='text-center uppercase text-sm mb-3'>{t('chooseANetwork')}</h6>
      <p className='max-w-xs mx-auto text-xs mb-8 text-center'>
        Select a network to switch to or change manually in your wallet.
      </p>
      <ul className='space-y-2 mx-auto max-w-sm'>
        {chains.map((chain) => (
          <NetworkSelectionButton
            key={chain.id}
            chain={chain}
            connector={connector}
            onClick={() => switchNetwork(chain.id)}
            pending={switchingToNetwork === chain.id}
            selected={network.chain.id === chain.id}
          />
        ))}
      </ul>
      <div className='mt-8 flex flex-col space-y-2 text-center'>
        {errorMessage && <p className='text-pt-red-light'>{errorMessage}</p>}
        <p className='text-xxxs'>
          {t('currentlyConnectedTo')}
          <b className={classNames('ml-1', { 'text-pt-red-light': network.chain.unsupported })}>
            {network.chain.name || getNetworkNiceNameByChainId(network.chain.id)}
          </b>
        </p>
      </div>
    </BottomSheet>
  )
}

interface NetworkSelectionButtonProps {
  connector: Connector
  chain: Chain
  selected: boolean
  pending: boolean
  onClick: () => void
}

const NetworkSelectionButton: React.FC<NetworkSelectionButtonProps> = (props) => {
  const { connector, chain, pending, selected, onClick } = props
  const { id, name } = chain

  return (
    <li>
      <button
        onClick={onClick}
        className={classNames(
          'bg-pt-purple-lighter dark:bg-pt-purple-darker rounded-lg p-4 flex items-center w-full transition-colors',
          'border',
          {
            'hover:border-highlight-1': !pending,
            'border-default': selected,
            'border-transparent': !selected
          }
        )}
        disabled={pending}
      >
        <NetworkIcon chainId={id} className='mx-1' sizeClassName='w-5 h-5 mr-2' />
        <span className='capitalize leading-none tracking-wider font-bold text-lg'>{name}</span>
        {pending && <ThemedClipSpinner sizeClassName='w-5 h-5 ml-2' />}
      </button>
    </li>
  )
}
