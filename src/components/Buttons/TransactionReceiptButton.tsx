import {
  formatBlockExplorerTxUrl,
  SquareLink,
  SquareButtonTheme,
  SquareButtonSize
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Transaction } from '@pooltogether/wallet-connection'

export const TransactionReceiptButton: React.FC<{
  chainId: number
  transaction: Transaction
  className?: string
  children?: React.ReactNode
}> = (props) => {
  const { chainId, transaction, className, children } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(transaction?.response?.hash, chainId)

  return (
    <SquareLink
      target='_blank'
      rel='noreferrer'
      href={url}
      theme={SquareButtonTheme.tealOutline}
      size={SquareButtonSize.md}
      className={className}
    >
      {children ? children : t('viewReceipt', 'View receipt')}
    </SquareLink>
  )
}
