import React, { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { ethers, BigNumber } from 'ethers'
import { TokenWithAllBalances } from '@pooltogether/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import {
  useUsersAddress,
  useTransaction,
  useWalletSigner,
  TransactionStatus,
  useSendTransaction
} from '@pooltogether/wallet-connection'
import {
  formatBlockExplorerTxUrl,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'

import ERC20Abi from '@abis/ERC20'

import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'

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
  const signer = useWalletSigner()
  const sendTransaction = useSendTransaction()
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)

  const submitApproveTransaction = async () => {
    const allowanceContract = new ethers.Contract(token, ERC20Abi, signer)

    let callTransaction: () => Promise<TransactionResponse>
    try {
      callTransaction = async () => allowanceContract.approve(twabRewardsAddress, amountUnformatted)
    } catch (e) {
      console.error(e)
      return
    }

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
        <SquareLink
          href={blockExplorerUrl}
          className='w-full mt-6'
          theme={SquareButtonTheme.tealOutline}
          target='_blank'
        >
          {t('viewReceipt', 'View receipt')}
        </SquareLink>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className='mx-4 text-inverse opacity-60'>
        <p className='pb-8'>
          {t(
            'promoRewardsNeedsApprovalDescription',
            `PoolTogether's Promotional Rewards contracts require you to send an approval transaction before depositing.`
          )}
        </p>
      </div>
      <SquareButton className='w-full' onClick={submitApproveTransaction}>
        {t('confirmApproval', 'Confirm approval')}
      </SquareButton>
    </div>
  )
}
