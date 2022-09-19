import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import { liquidatorChainIdAtom } from '@liquidator/atoms'
import { useLiquidatorAddress } from '@liquidator/hooks/useLiquidatorAddress'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { useTokenAllowance } from '@pooltogether/hooks'
import {
  TransactionStatus,
  useSendTransaction,
  useTransaction,
  useUsersAddress,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { approveErc20Spender } from '@utils/transactions/approveErc20Spender'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { useSigner } from 'wagmi'

export const ApproveSwapButton: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const { data: signer } = useSigner()
  const walletChainId = useWalletChainId()
  const [transactionId, setTransactionId] = useState<string>()
  const { t } = useTranslation()
  const transaction = useTransaction(transactionId)
  const sendTransaction = useSendTransaction()
  const usersAddress = useUsersAddress()
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const liquidatorAddress = useLiquidatorAddress(chainId)
  const prizeToken = usePrizeToken(chainId)
  const {
    data: allowance,
    isFetched: isAllowanceFetched,
    refetch: refetchAllowance
  } = useTokenAllowance(chainId, usersAddress, liquidatorAddress, prizeToken?.address)

  if (
    !usersAddress ||
    walletChainId !== chainId ||
    !isAllowanceFetched ||
    (!allowance.isZero() && !transaction)
  ) {
    return null
  }

  const submitApproveTransaction = async () => {
    const callTransaction = () =>
      approveErc20Spender(signer, prizeToken?.address, liquidatorAddress)

    const transactionId = sendTransaction({
      name: t('allowTicker', { ticker: prizeToken?.name }),
      callTransaction,
      callbacks: {
        onSuccess: async () => {
          refetchAllowance()
        }
      }
    })
    setTransactionId(transactionId)
  }

  if (transaction?.status === TransactionStatus.success) {
    return (
      <TransactionReceiptButton
        chainId={chainId}
        transaction={transaction}
        className={classNames(className, 'w-full capitalize flex items-center space-x-2')}
      >
        <span>View approval receipt</span>
        <FeatherIcon className='w-4 h-4' icon='external-link' />
      </TransactionReceiptButton>
    )
  }

  return (
    <TxButton
      type='button'
      chainId={chainId}
      state={transaction?.state}
      status={transaction?.status}
      className={classNames(className, 'w-full capitalize')}
      onClick={() => submitApproveTransaction()}
    >
      Allow PoolTogether to use your {prizeToken.symbol}
    </TxButton>
  )
}
