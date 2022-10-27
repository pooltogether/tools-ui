import { liquidatorChainIdAtom, slippagePercentAtom, ticketTokenAtom } from '@liquidator/atoms'
import { useExactAmountOut } from '@liquidator/hooks/useExactAmountOut'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { useTicketAvailableLiquidity } from '@liquidator/hooks/useTicketAvailableLiquidity'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import { Collapse, ThemedClipSpinner } from '@pooltogether/react-components'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { percentageOfBigNumber } from '@utils/percentageOfBigNumber'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import React from 'react'
import { useWatch } from 'react-hook-form'

// TODO: Show discounts
export const SwapInfo: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props

  const [ticket] = useAtom(ticketTokenAtom)

  if (!ticket) return null

  return (
    <Collapse
      className={classNames(
        className,
        'w-full hover:bg-pt-purple-light dark:hover:bg-pt-purple-dark justify-between px-2 rounded transition hover:bg-opacity-50 dark:hover:bg-opacity-50'
      )}
      title={<SwapInfoTitle />}
    >
      <SwapInfoFullList className={'mb-4'} />
    </Collapse>
  )
}

const SwapInfoTitle = () => {
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)
  const prizeToken = usePrizeToken(chainId)
  const {
    data: amountOut,
    isFetching: isExactAmountOutFetching,
    isFetched: isExactAmountOutFetched,
    error
  } = useExactAmountOut(chainId, ticket, '1')

  return (
    <div className='flex flex-col text-xxs font-normal py-1'>
      {isExactAmountOutFetching && (
        <div className='h-5 flex items-center'>
          <ThemedClipSpinner sizeClassName='w-4 h-4' />
        </div>
      )}
      {!isExactAmountOutFetching && isExactAmountOutFetched && !error && (
        <div className='h-5'>
          1 {prizeToken?.symbol} = {amountOut.amount} {ticket.symbol}
        </div>
      )}
      {!isExactAmountOutFetching && !!error && (
        <div className='h-5 text-pt-red-light'>Insufficient liquidity</div>
      )}
    </div>
  )
}

const SwapInfoFullList: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const amountIn = useWatch<LiquidatorFormValues>({ name: 'amountIn' })

  return (
    <ul className={classNames(className, 'px-2 text-xxs')}>
      {/* <li>The current Uniswap price</li> */}
      <AvailableLiquidity />
      <ExpectedOutput amountIn={amountIn} />
      <hr className='my-2 mx-auto border-t border-pt-purple-darker' />
      <MinimumOutput amountIn={amountIn} />
    </ul>
  )
}

const AvailableLiquidity = () => {
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)
  const { data, isFetched, isFetching, isError } = useTicketAvailableLiquidity(chainId, ticket)
  return (
    <ListItem
      left={'Available liquidity'}
      isError={isError}
      right={
        isFetched && !isFetching && !isError ? (
          <div className='flex space-x-2'>
            <span>{data.amount}</span>
            <span>{ticket.symbol}</span>
          </div>
        ) : (
          <ThemedClipSpinner sizeClassName='w-3 h-3' />
        )
      }
    />
  )
}

const ExpectedOutput: React.FC<{ amountIn: string }> = (props) => {
  const { amountIn } = props
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)

  const { data, isFetched, isError, isFetching } = useExactAmountOut(chainId, ticket, amountIn)
  return (
    <ListItem
      left={'Expected output'}
      isError={isError}
      right={
        isFetched && !isFetching && !isError ? (
          data.amount
        ) : isFetching ? (
          <ThemedClipSpinner sizeClassName='w-3 h-3' />
        ) : null
      }
    />
  )
}

const MinimumOutput: React.FC<{ amountIn: string }> = (props) => {
  const { amountIn } = props
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)
  const {
    data: amountOut,
    isFetched,
    isFetching,
    isError
  } = useExactAmountOut(chainId, ticket, amountIn)
  const [slippagePercent] = useAtom(slippagePercentAtom)

  const amount =
    isFetched && !isFetching && !isError
      ? getAmountFromUnformatted(
          amountOut.amountUnformatted.sub(
            percentageOfBigNumber(amountOut.amountUnformatted, slippagePercent)
          ),
          ticket?.decimals
        )
      : null

  return (
    <ListItem
      className='opacity-70'
      left={`Minimum received after slippage (${slippagePercent * 100}%)`}
      right={!!amount ? amount.amount : null}
    />
  )
}

const ListItem: React.FC<{
  className?: string
  left: React.ReactNode
  right: React.ReactNode
  isError?: boolean
}> = (props) => (
  <li className={classNames(props.className, 'flex justify-between')}>
    <div>{props.left}</div>
    <div className={classNames({ 'text-pt-red-light': props.isError })}>
      {props.isError ? '' : props.right}
    </div>
  </li>
)
