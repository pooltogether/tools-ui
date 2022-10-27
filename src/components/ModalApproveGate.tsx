import { TxButton } from '@components/Buttons/TxButton'
import { TransactionResponse } from '@ethersproject/providers'
import { TokenWithAllBalances } from '@pooltogether/hooks'
import { ButtonLink, ButtonTheme, ThemedClipSpinner } from '@pooltogether/react-components'
import {
  useUsersAddress,
  useTransaction,
  TransactionStatus,
  useSendTransaction,
  formatBlockExplorerTxUrl
} from '@pooltogether/wallet-connection'
import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'
import { approveErc20Spender } from '@utils/transactions/approveErc20Spender'
import classNames from 'classnames'
import { ethers, BigNumber } from 'ethers'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { useSigner } from 'wagmi'

interface ModalApproveGateProps {
  chainId: number
  amountUnformatted: BigNumber
  token: string
  tokenData: TokenWithAllBalances
  twabRewardsAllowanceRefetch: () => void
  className?: string
}

export const ModalApproveGate = (props: ModalApproveGateProps) => {
  const { className, chainId, amountUnformatted, token, tokenData, twabRewardsAllowanceRefetch } =
    props

  const [transactionId, setTransactionId] = useState<string>()
  const { t } = useTranslation()

  const transaction = useTransaction(transactionId)
  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)

  const submitApproveTransaction = async () => {
    const callTransaction = () =>
      approveErc20Spender(signer, token, twabRewardsAddress, amountUnformatted)

    const transactionId = sendTransaction({
      name: t('allowTicker', { ticker: tokenData?.name }),
      callTransaction,
      callbacks: {
        onSuccess: async () => {
          twabRewardsAllowanceRefetch()
        }
      }
    })
    setTransactionId(transactionId)
  }

  if (transaction?.status === TransactionStatus.pendingBlockchainConfirmation) {
    const blockExplorerUrl = formatBlockExplorerTxUrl(transaction.response.hash, chainId)
    return (
      <div className={classNames(className, 'flex flex-col')}>
        <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />
        <div className='text-inverse opacity-60'>
          <p className='mb-4 text-center mx-8'>
            {t(
              'onceYourApprovalTxHasFinished',
              'Once your approval transaction has finished successfully you can deposit.'
            )}
          </p>
        </div>
        <ButtonLink
          href={blockExplorerUrl}
          className='w-full mt-6'
          theme={ButtonTheme.tealOutline}
          target='_blank'
        >
          {t('viewReceipt', 'View receipt')}
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className='mx-4 text-inverse opacity-60'>
        <p className='pb-8 text-center'>
          {t(
            'promoRewardsNeedsApprovalDescription',
            `PoolTogether's Promotional Rewards contracts require you to send an approval transaction before depositing.`
          )}
        </p>
      </div>
      <TxButton
        className='w-full'
        onClick={submitApproveTransaction}
        chainId={chainId}
        state={transaction?.state}
        status={transaction?.status}
      >
        {t('confirmApproval', 'Confirm approval')}
      </TxButton>
    </div>
  )
}
