import { useAtom } from 'jotai'
import { liquidatorChainIdAtom, swapOutStateAtom, ticketTokenAtom } from '../../atoms'
import { TokenToSwap } from './TokenToSwap'
import { SwapAmountContainer } from './SwapAmountContainer'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import { useFormContext } from 'react-hook-form'
import { useExpectedSwapAmountOut } from '@liquidator/hooks/useExpectedSwapAmountOut'
import { Token } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import classNames from 'classnames'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { useTicketAvailableLiquidity } from '@liquidator/hooks/useTicketAvailableLiquidity'

export const SwapOut: React.FC<{}> = (props) => {
  const {
    reset: resetForm,
    watch,
    formState: { errors, isValid, isValidating }
  } = useFormContext<LiquidatorFormValues>()
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const prizeToken = usePrizeToken(chainId)
  const [ticket] = useAtom(ticketTokenAtom)
  const [swapOutState] = useAtom(swapOutStateAtom)

  // TODO: Crashes when deleting and you only have '.'
  const amountIn = watch('amountIn')
  const amountUnformatted =
    isValid && !isValidating && !!amountIn ? parseUnits(amountIn, prizeToken.decimals) : null

  return (
    <div>
      <SwapAmountContainer>
        <div className='flex mb-1 space-x-2'>
          <SwapOutAmount chainId={chainId} ticket={ticket} amountUnformatted={amountUnformatted} />
          <TokenToSwap swapState={swapOutState} resetForm={resetForm} />
        </div>
        <div className='flex justify-end'>
          {/* TODO: This should be max amount not balance */}
          <MaxLiquidity ticket={ticket} />
        </div>
      </SwapAmountContainer>
    </div>
  )
}

const SwapOutAmount: React.FC<{ chainId: number; ticket: Token; amountUnformatted: BigNumber }> = (
  props
) => {
  const { chainId, ticket, amountUnformatted } = props
  const { data, isFetched, error, isError, isFetching } = useExpectedSwapAmountOut(
    chainId,
    ticket,
    amountUnformatted
  )
  return (
    <span
      className={classNames('w-full font-semibold xs:text-lg cursor-not-allowed', {
        'opacity-80': !isFetching,
        'opacity-50': isFetching
      })}
    >
      {data?.amount || '0'}
    </span>
  )
}

const MaxLiquidity: React.FC<{ ticket: Token }> = (props) => {
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const usersAddress = useUsersAddress()
  const { ticket } = props
  const { data, isFetched } = useTicketAvailableLiquidity(chainId, ticket)
  const { t } = useTranslation()

  if (!usersAddress || !ticket || !isFetched) return null

  return (
    // TODO: Need to fetch the inverse amount and set it
    // <button onClick={() => setValue('amountIn', tokenWithBalance.amount)}>
    <div className='text-xxs transition opacity-70 hover:opacity-100 space-x-1'>
      <span>{t('max', 'Max')}:</span>
      <span>{data?.amountPretty}</span>
    </div>
    // </button>
  )
}
