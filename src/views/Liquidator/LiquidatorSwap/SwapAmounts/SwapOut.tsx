import { useAtom } from 'jotai'
import { liquidatorChainIdAtom, swapOutStateAtom, ticketTokenAtom } from '../../atoms'
import { TokenToSwap } from './TokenToSwap'
import { SwapAmountContainer } from './SwapAmountContainer'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import { useFormContext, useWatch } from 'react-hook-form'
import { Token } from '@pooltogether/hooks'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useTicketAvailableLiquidity } from '@liquidator/hooks/useTicketAvailableLiquidity'
import { useExactAmountOut } from '@liquidator/hooks/useExactAmountOut'
import { useExactAmountIn } from '@liquidator/hooks/useExactAmountIn'

export const SwapOut: React.FC<{}> = (props) => {
  const { reset: resetForm, watch } = useFormContext<LiquidatorFormValues>()
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const prizeToken = usePrizeToken(chainId)
  const [ticket] = useAtom(ticketTokenAtom)
  const [swapOutState] = useAtom(swapOutStateAtom)
  const amountIn = watch('amountIn')

  return (
    <div>
      <SwapAmountContainer>
        <div className='flex mb-1 space-x-2'>
          <SwapOutAmount chainId={chainId} ticket={ticket} amountIn={amountIn} />
          <TokenToSwap swapState={swapOutState} resetForm={resetForm} />
        </div>
        <div className='flex justify-end'>
          <MaxLiquidity ticket={ticket} />
        </div>
      </SwapAmountContainer>
    </div>
  )
}

const SwapOutAmount: React.FC<{ chainId: number; ticket: Token; amountIn: string }> = (props) => {
  const { chainId, ticket, amountIn } = props
  const { data } = useExactAmountOut(chainId, ticket, amountIn)
  return (
    <span className={classNames('w-full font-semibold xs:text-lg cursor-not-allowed opacity-60')}>
      {data?.amount || '0'}
    </span>
  )
}

const MaxLiquidity: React.FC<{ ticket: Token }> = (props) => {
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const { ticket } = props
  const { setValue } = useFormContext()
  const { data: ticketLiquidity, isFetched: isTicketLiquidityFetched } =
    useTicketAvailableLiquidity(chainId, ticket)
  const { t } = useTranslation()
  const { data: exactAmountIn, isFetched: isExactAmountInFetched } = useExactAmountIn(
    chainId,
    ticket,
    ticketLiquidity?.amount
  )

  if (!ticket || !isTicketLiquidityFetched) return null

  return (
    <button
      onClick={() => {
        if (isExactAmountInFetched) setValue('amountIn', exactAmountIn.amount)
      }}
    >
      <div className='text-xxs transition opacity-70 hover:opacity-100 space-x-1'>
        <span>{t('max', 'Max')}:</span>
        <span>{ticketLiquidity?.amountPretty}</span>
      </div>
    </button>
  )
}
