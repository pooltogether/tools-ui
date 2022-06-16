import { useAtom } from 'jotai'
import { liquidatorChainIdAtom, swapInStateAtom, ticketTokenAtom } from '@liquidator/atoms'
import { SwapInput } from '@liquidator/LiquidatorSwap/SwapAmounts/SwapInput'
import { TokenToSwap } from '@liquidator/LiquidatorSwap/SwapAmounts/TokenToSwap'
import { useFormContext, UseFormSetValue, useWatch } from 'react-hook-form'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import classNames from 'classnames'
import { SwapAmountContainer } from './SwapAmountContainer'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useLiquidatorAddress } from '@liquidator/hooks/useLiquidatorAddress'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { useExactAmountOut } from '@liquidator/hooks/useExactAmountOut'
import { useEffect } from 'react'

export const SwapIn: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const amountIn = useWatch<LiquidatorFormValues>({ name: 'amountIn' })

  const {
    register,
    reset: resetForm,
    setValue,
    formState: { errors, isDirty },
    trigger
  } = useFormContext<LiquidatorFormValues>()
  const [swapInState] = useAtom(swapInStateAtom)
  const usersAddress = useUsersAddress()
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const liquidatorAddress = useLiquidatorAddress(chainId)
  const prizeToken = usePrizeToken(chainId)
  const {
    data: allowance,
    isFetched: isAllowanceFetched,
    isFetching: isAllowanceFetching
  } = useTokenAllowance(chainId, usersAddress, liquidatorAddress, prizeToken.address)
  const {
    data: balance,
    isFetched: isUsersBalanceFetched,
    isFetching: isUsersBalanceFetching
  } = useTokenBalance(chainId, usersAddress, prizeToken.address)
  const [ticket] = useAtom(ticketTokenAtom)
  const {
    data: amountOut,
    isFetched: isExactAmountOutFetched,
    isError: isExactAmountError,
    isFetching: isExactAmountFetching
  } = useExactAmountOut(chainId, ticket, amountIn)

  // trigger validation when data is fetched
  useEffect(() => {
    if (isExactAmountOutFetched && isUsersBalanceFetched && isAllowanceFetched) {
      trigger('amountIn')
    }
  }, [
    isExactAmountFetching,
    isUsersBalanceFetching,
    isAllowanceFetching,
    isExactAmountOutFetched,
    isUsersBalanceFetched,
    isAllowanceFetched
  ])

  console.log({ isExactAmountOutFetched, isExactAmountFetching })

  return (
    <SwapAmountContainer
      className={classNames(
        className,
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-pt-teal hover:ring-opacity-50 transition',
        {
          'ring-2 ring-pt-red-light': !!errors.amountIn
        }
      )}
    >
      <div className='flex mb-1 space-x-2'>
        <SwapInput
          className='w-full'
          placeholder='0'
          {...register('amountIn', {
            required: {
              value: true,
              message: 'Amount required'
            },
            validate: {
              isAllowanceFetched: () => !!isAllowanceFetched || 'Fetching allowance',
              isBalanceFetched: () => !!isUsersBalanceFetched || 'Fetching balance',
              isAmountOutFetched: () => {
                console.log('isAmountOutFetched', { isExactAmountOutFetched })
                return !!isExactAmountOutFetched || 'Fetching amount to receive'
              },
              isAmountBigNumberish: (v) => {
                try {
                  if (v === '.') throw new Error()
                  parseUnits(v, prizeToken.decimals)
                  return true
                } catch (e) {
                  return 'Invalid amount'
                }
              },
              isAmountNonZero: (v) => {
                const amountUnformatted = parseUnits(v, prizeToken.decimals)
                return !amountUnformatted.isZero() || 'Invalid amount'
              },
              isAmountPositive: (v) => {
                const amountUnformatted = parseUnits(v, prizeToken.decimals)
                return !amountUnformatted.isNegative() || 'Invalid amount'
              },
              isAllowanceSufficient: (v) => {
                const amountUnformatted = parseUnits(v, prizeToken.decimals)
                return amountUnformatted.lte(allowance) || 'Insufficient allowance'
              },
              isBalanceSufficient: (v) => {
                const amountUnformatted = parseUnits(v, prizeToken.decimals)
                return amountUnformatted.lte(balance.amountUnformatted) || 'Insufficient balance'
              },
              isLiquiditySufficient: (v) => {
                return !isExactAmountError || 'Insufficient liquidity'
                // TODO: Validate
                // - Liquidator has enough tokens to send out
              },
              isAmountOutNonZero: (v) => {
                if (!amountOut) return 'No tokens will be received'
                return !amountOut.amountUnformatted.isZero() || 'Invalid amount'
              }
            }
          })}
        />
        <TokenToSwap swapState={swapInState} resetForm={resetForm} />
      </div>
      <div className='flex justify-end'>
        <PrizeTokenBalance setValue={setValue} />
      </div>
    </SwapAmountContainer>
  )
}

const PrizeTokenBalance: React.FC<{ setValue: UseFormSetValue<LiquidatorFormValues> }> = (
  props
) => {
  const { setValue } = props
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const prizeToken = usePrizeToken(chainId)
  const usersAddress = useUsersAddress()
  const { data: tokenWithBalance, isFetched } = useTokenBalance(
    chainId,
    usersAddress,
    prizeToken?.address
  )
  const { t } = useTranslation()

  if (!usersAddress || !isFetched) return null

  return (
    <button onClick={() => setValue('amountIn', tokenWithBalance.amount)}>
      <div className='text-xxs transition opacity-70 hover:opacity-100 space-x-1'>
        <span>{t('balance', 'Balance')}:</span>
        <span>{tokenWithBalance?.amountPretty}</span>
      </div>
    </button>
  )
}
