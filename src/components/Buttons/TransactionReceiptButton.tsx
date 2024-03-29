import { ButtonLink, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { formatBlockExplorerTxUrl, Transaction } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const TransactionReceiptButton: React.FC<{
  chainId: number
  transaction: Transaction
  size?: ButtonSize
  theme?: ButtonTheme
  className?: string
  children?: React.ReactNode
}> = (props) => {
  const { chainId, transaction, className, children, size, theme } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(transaction?.response?.hash, chainId)

  return (
    <ButtonLink
      target='_blank'
      rel='noreferrer'
      href={url}
      theme={theme}
      size={size}
      className={className}
    >
      {children ? (
        children
      ) : (
        <div className='flex items-center space-x-2'>
          <span>{t('viewReceipt', 'View receipt')}</span>
          <FeatherIcon
            icon='external-link'
            className={classNames({
              'w-4 h-4': size !== ButtonSize.sm,
              'w-3 h-3': size === ButtonSize.sm
            })}
          />
        </div>
      )}
    </ButtonLink>
  )
}

TransactionReceiptButton.defaultProps = {
  size: ButtonSize.md,
  theme: ButtonTheme.tealOutline
}
