import React from 'react'
import { useTranslation } from 'react-i18next'
import { SquareButton, SquareButtonProps, ThemedClipSpinner } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useIsWalletOnChainId } from '@pooltogether/wallet-connection'

export interface TransactionButtonProps extends SquareButtonProps {
  chainId: number
  pending?: boolean
}

export const TransactionButton = (props: TransactionButtonProps) => {
  const { chainId, disabled, pending, children, ...squareButtonProps } = props

  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)

  return (
    <SquareButton {...squareButtonProps} disabled={!isWalletOnProperNetwork || disabled}>
      {isWalletOnProperNetwork && (
        <>
          {children}
          {pending && <ThemedClipSpinner sizeClassName='ml-2 w-4 h-4' />}
        </>
      )}
      {!isWalletOnProperNetwork &&
        t('connectToNetwork', 'Connect to {{networkName}}', { networkName })}
    </SquareButton>
  )
}
