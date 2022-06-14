import { TransactionButton } from '@components/Buttons/TransactionButton'
import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import { liquidatorChainIdAtom, ticketTokenAtom } from '@liquidator/atoms'
import { useLiquidatorAddress } from '@liquidator/hooks/useLiquidatorAddress'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { useTokenAllowance } from '@pooltogether/hooks'
import {
  TransactionStatus,
  useSendTransaction,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { approveErc20Spender } from '@utils/transactions/approveErc20Spender'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { FieldError, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSigner } from 'wagmi'

// TODO: Pass form errors for insufficient balance, disable button and change text
export const SendSwapButton: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const { data: signer } = useSigner()
  const [transactionId, setTransactionId] = useState<string>()
  const { t } = useTranslation()
  const transaction = useTransaction(transactionId)
  const sendTransaction = useSendTransaction()
  const usersAddress = useUsersAddress()
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const liquidatorAddress = useLiquidatorAddress(chainId)
  const prizeToken = usePrizeToken(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    liquidatorAddress,
    prizeToken.address
  )
  const { isValid, errors } = useFormState()
  const [ticket] = useAtom(ticketTokenAtom)

  const disabled = !isValid

  if (!usersAddress || !ticket || !isAllowanceFetched) {
    return null
  }

  const submitSwapTransaction = async () => {
    console.log('TODO: Actually swap')
    // const callTransaction = () => {

    // }

    // const transactionId = sendTransaction({
    //   name: t('allowTicker', { ticker: prizeToken?.name }),
    //   callTransaction,
    //   callbacks: {
    //     onSuccess: async () => {
    //       refetchAllowance()
    //     }
    //   }
    // })
    // setTransactionId(transactionId)
  }

  if (transaction?.status === TransactionStatus.success) {
    return (
      <TransactionReceiptButton chainId={chainId} transaction={transaction}>
        View approval receipt
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
      disabled={disabled}
      onClick={() => submitSwapTransaction()}
    >
      {errors?.amountIn?.message || 'Swap'}
    </TxButton>
  )
}
