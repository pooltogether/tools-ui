import liquidatorAbi from '@liquidator/abis/Liquidator'
import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import { liquidatorChainIdAtom, slippagePercentAtom, ticketTokenAtom } from '@liquidator/atoms'
import { useLiquidatorAddress } from '@liquidator/hooks/useLiquidatorAddress'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { useExactAmountOut } from '@liquidator/hooks/useExactAmountOut'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import {
  TransactionStatus,
  useSendTransaction,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSigner } from 'wagmi'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import { ethers } from 'ethers'
import { useTicketPrizePoolAddress } from '@liquidator/hooks/useTicketPrizePoolAddress'
import { percentageOfBigNumber } from '@utils/percentageOfBigNumber'
import { useTicketAvailableLiquidity } from '@liquidator/hooks/useTicketAvailableLiquidity'

/**
 *
 * @param props
 * @returns
 */
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
  const { isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    liquidatorAddress,
    prizeToken.address
  )
  const { refetch: refetchPrizeTokenBalance } = useTokenBalance(
    chainId,
    usersAddress,
    prizeToken.address
  )
  const { isValid, isValidating, errors } = useFormState()
  const [ticket] = useAtom(ticketTokenAtom)
  const [slippagePercent] = useAtom(slippagePercentAtom)
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  const amountIn = useWatch<LiquidatorFormValues>({ name: 'amountIn' })
  const {
    data: amountOut,
    isFetched: isExactAmountFetched,
    isError: isExactAmountError,
    isFetching: isExactAmountFetching,
    refetch: refetchExactAmountOut
  } = useExactAmountOut(chainId, ticket, amountIn)
  const { refetch: refetchTicketLiquidity } = useTicketAvailableLiquidity(chainId, ticket)

  const disabled =
    !isValid || isValidating || !isExactAmountFetched || isExactAmountError || isExactAmountFetching
  console.log({
    disabled,
    isValid,
    isValidating,
    isExactAmountFetched,
    isExactAmountError,
    isExactAmountFetching
  })

  if (!usersAddress || !ticket || !isAllowanceFetched) {
    return null
  }

  const submitSwapTransaction = async () => {
    const callTransaction = () => {
      const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
      const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, signer)
      const amountInUnformatted = parseUnits(amountIn, prizeToken.decimals)
      return liquidatorContract.functions.swapExactAmountIn(
        prizePoolAddress,
        amountInUnformatted,
        amountOut.amountUnformatted.sub(
          percentageOfBigNumber(amountOut.amountUnformatted, slippagePercent)
        )
      )
    }

    const transactionId = sendTransaction({
      name: `Swap ${prizeToken.symbol} for ${ticket.symbol}`,
      callTransaction,
      callbacks: {
        refetch: () => {
          refetchExactAmountOut()
          refetchPrizeTokenBalance()
          refetchTicketLiquidity()
        }
        // TODO: Refetch all of the things
      }
    })
    setTransactionId(transactionId)
  }

  const showReceiptButton = transaction?.status === TransactionStatus.success

  return (
    <div className={className}>
      <TxButton
        type='button'
        chainId={chainId}
        state={transaction?.state}
        status={transaction?.status}
        className={classNames('w-full capitalize', { 'mb-2': showReceiptButton })}
        disabled={disabled}
        onClick={() => submitSwapTransaction()}
      >
        {errors?.amountIn?.message || 'Swap'}
      </TxButton>
      {showReceiptButton && (
        <TransactionReceiptButton chainId={chainId} transaction={transaction} />
      )}
    </div>
  )
}
