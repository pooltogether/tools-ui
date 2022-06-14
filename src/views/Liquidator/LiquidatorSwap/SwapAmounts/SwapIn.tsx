import { useAtom } from 'jotai'
import { liquidatorChainIdAtom, swapInStateAtom } from '@liquidator/atoms'
import { SwapInput } from '@liquidator/LiquidatorSwap/SwapAmounts/SwapInput'
import { TokenToSwap } from '@liquidator/LiquidatorSwap/SwapAmounts/TokenToSwap'
import { useFormContext, UseFormSetValue } from 'react-hook-form'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import classNames from 'classnames'
import { SwapAmountContainer } from './SwapAmountContainer'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useLiquidatorAddress } from '@liquidator/hooks/useLiquidatorAddress'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'

export const SwapIn: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const {
    register,
    reset: resetForm,
    setValue,
    formState: { errors }
  } = useFormContext<LiquidatorFormValues>()
  const [swapInState] = useAtom(swapInStateAtom)
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
  const { data: balance, isFetched: isUsersBalanceFetched } = useTokenBalance(
    chainId,
    usersAddress,
    prizeToken.address
  )

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
              message: 'Amount is required'
            },
            validate: {
              isAllowanceFetched: () => !!isAllowanceFetched,
              isBalanceFetched: () => !!isUsersBalanceFetched,
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
              isAllowanceSufficient: (v) => {
                const amountUnformatted = parseUnits(v, prizeToken.decimals)
                return amountUnformatted.lte(allowance) || 'Insufficient allowance'
              },
              isBalanceSufficient: (v) => {
                const amountUnformatted = parseUnits(v, prizeToken.decimals)
                return amountUnformatted.lte(balance.amountUnformatted) || 'Insufficient balance'
              }
              // TODO: Validate
              // - Liquidator has enough tokens to send out
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
