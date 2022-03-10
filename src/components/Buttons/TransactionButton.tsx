import React from 'react'
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import {
  SquareButton,
  SquareButtonProps,
  overrideToolTipPosition,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useIsWalletOnNetwork } from '@hooks/wallet/useIsWalletOnNetwork'

export interface TransactionButtonProps extends SquareButtonProps {
  chainId: number
  toolTipId: string
  pending?: boolean
}

export const TransactionButton = (props: TransactionButtonProps) => {
  const { chainId, disabled, pending, toolTipId, children, ...squareButtonProps } = props

  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
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
