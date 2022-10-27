import { Button, ButtonProps, ThemedClipSpinner } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useIsWalletOnChainId } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface TransactionButtonProps extends ButtonProps {
  chainId: number
  pending?: boolean
}

export const TransactionButton = (props: TransactionButtonProps) => {
  const { chainId, disabled, pending, children, ...squareButtonProps } = props

  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)

  return (
    <Button {...squareButtonProps} disabled={!isWalletOnProperNetwork || disabled}>
      {isWalletOnProperNetwork && (
        <>
          {children}
          {pending && <ThemedClipSpinner sizeClassName='ml-2 w-4 h-4' />}
        </>
      )}
      {!isWalletOnProperNetwork &&
        t('connectToNetwork', 'Connect to {{networkName}}', { networkName })}
    </Button>
  )
}
