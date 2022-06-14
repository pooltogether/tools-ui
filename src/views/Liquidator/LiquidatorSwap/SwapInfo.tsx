import { liquidatorChainIdAtom, slippagePercentAtom, ticketTokenAtom } from '@liquidator/atoms'
import { useSwapPrice } from '@liquidator/hooks/useSwapPrice'
import { Collapse, ThemedClipSpinner } from '@pooltogether/react-components'
import { useAtom } from 'jotai'
import classNames from 'classnames'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import React from 'react'
import { useTicketAvailableLiquidity } from '@liquidator/hooks/useTicketAvailableLiquidity'
import { useExpectedSwapAmountOut } from '@liquidator/hooks/useExpectedSwapAmountOut'
import { useFormState, UseFormWatch, useWatch } from 'react-hook-form'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { percentageOfBigNumber } from '@utils/percentageOfBigNumber'

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
    data: swapPrice,
    isFetching: isSwapPriceFetching,
    isFetched: isSwapPriceFetched,
    error
  } = useSwapPrice(chainId, ticket)

  return (
    <div className='flex flex-col text-xxs font-normal py-1'>
      {isSwapPriceFetching && (
        <div className='h-5 flex items-center'>
          <ThemedClipSpinner sizeClassName='w-4 h-4' />
        </div>
      )}
      {!isSwapPriceFetching && isSwapPriceFetched && !error && (
        <div className='h-5'>
          1 {prizeToken.symbol} = {swapPrice.amount} {ticket.symbol}
        </div>
      )}
      {!isSwapPriceFetching && !!error && (
        <div className='h-5 text-pt-red-light'>Insufficient liquidity</div>
      )}
    </div>
  )
}

const SwapInfoFullList: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const prizeToken = usePrizeToken(chainId)

  const { isValid, isValidating } = useFormState()
  const amountIn = useWatch<LiquidatorFormValues>({ name: 'amountIn' })
  const amountUnformatted =
    isValid && !isValidating && !!amountIn ? parseUnits(amountIn, prizeToken.decimals) : null

  return (
    <ul className={classNames(className, 'px-2')}>
      {/* <li>The current Uniswap price</li> */}
      <AvailableLiquidity />
      <ExpectedOutput amountUnformatted={amountUnformatted} />
      <hr className='my-2 mx-auto border-t' />
      <MinimumOutput amountUnformatted={amountUnformatted} />
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

const ExpectedOutput: React.FC<{ amountUnformatted: BigNumber }> = (props) => {
  const { amountUnformatted } = props
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)

  const { data, isFetched, error, isError, isFetching } = useExpectedSwapAmountOut(
    chainId,
    ticket,
    amountUnformatted
  )
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

const MinimumOutput: React.FC<{ amountUnformatted: BigNumber }> = (props) => {
  const { amountUnformatted } = props
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)
  const [slippagePercent] = useAtom(slippagePercentAtom)

  const amount = amountUnformatted
    ? getAmountFromBigNumber(
        amountUnformatted.sub(percentageOfBigNumber(amountUnformatted, slippagePercent)),
        ticket?.decimals
      )
    : null

  return (
    <ListItem
      left={`Minimum received after slippage (${slippagePercent * 100}%)`}
      right={!!amount ? amount.amount : null}
    />
  )
}

const ListItem: React.FC<{ left: React.ReactNode; right: React.ReactNode; isError?: boolean }> = (
  props
) => (
  <li className='flex justify-between'>
    <div>{props.left}</div>
    <div className={classNames({ 'text-pt-red-light': props.isError })}>
      {props.isError ? 'Error' : props.right}
    </div>
  </li>
)
