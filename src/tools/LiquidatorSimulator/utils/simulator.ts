import { ChaosLevel, SimulatedTick, SimulatorConfig } from '../interfaces'
import { swapExactAmountOut, computeExactAmountIn } from './liquidator'
import { applyRandomScaling } from './randomNumber'

// NOTE: This is used for both the simulator market rates AND the swapMultiplier & liquidityFraction. The latter are also scaled in the contracts by 1e9.
export const RATE_SCALAR = 1e9

export function simulateSwapExactAmountOut(config: SimulatorConfig) {
  let {
    ticks: _ticks,
    tickLength: _tickLength,
    virtualReserveIn: _virtualReserveIn,
    virtualReserveOut: _virtualReserveOut,
    tokenInDecimals: _tokenInDecimals,
    tokenOutDecimals: _tokenOutDecimals,
    totalValueLockedOut: _totalValueLockedOut,
    swapMultiplier: _swapMultiplier,
    liquidityFraction: _liquidityFraction,
    minimumK: _minimumK,
    marketRates: _marketRates,
    yieldYearlyAprRates: _yieldYearlyAprRates,
    minimumProfit: _minimumProfit,
    chaosLevel: _chaosLevel
  } = config

  const MARKET_RATES = _marketRates.reduce(
    (acc, { time, rate }) => ({
      [time]: rate,
      ...acc
    }),
    {}
  )
  const YIELD_YEARLY_APR = _yieldYearlyAprRates.reduce(
    (acc, { time, rate }) => ({
      [time]: rate,
      ...acc
    }),
    {}
  )

  const simulatedTicks: SimulatedTick[] = []
  const emptySwap = {
    amountOut: BigInt(0),
    amountIn: BigInt(0),
    profit: BigInt(0),
    profitable: false,
    swapPercent: BigInt(0),
    marketAmountOut: BigInt(0)
  }
  const initialTick: SimulatedTick = {
    tvl: _totalValueLockedOut,
    amountToAccrue: BigInt(0),
    marketRate: BigInt(0),
    yearlyApr: YIELD_YEARLY_APR[0],
    totalAmountOut: BigInt(0),
    totalYield: BigInt(0),
    initial: {
      virtualReserveIn: _virtualReserveIn,
      virtualReserveOut: _virtualReserveOut,
      availableYield: BigInt(0)
    },
    swap: emptySwap,
    final: {
      virtualReserveIn: _virtualReserveIn,
      virtualReserveOut: _virtualReserveOut,
      availableYield: BigInt(0)
    }
  }

  for (let time = 0; time < _ticks; time++) {
    const previousTick: SimulatedTick = simulatedTicks[time - 1] || initialTick
    let tickData: SimulatedTick = {
      ...initialTick,
      totalAmountOut: previousTick.totalAmountOut,
      totalYield: previousTick.totalYield,
      marketRate: previousTick.marketRate,
      yearlyApr: previousTick.yearlyApr,
      initial: previousTick.final,
      final: previousTick.final
    }

    // Compute yield
    tickData.tvl = applyRandomScaling(tickData.tvl, time, _chaosLevel)

    if (!!MARKET_RATES[time]) {
      tickData.marketRate = MARKET_RATES[time]
    }
    if (!!YIELD_YEARLY_APR[time]) {
      tickData.yearlyApr = YIELD_YEARLY_APR[time]
    }

    tickData.amountToAccrue =
      (tickData.yearlyApr * tickData.tvl * BigInt(_tickLength)) / BigInt(RATE_SCALAR * 365 * 24)
    tickData.final.availableYield = tickData.initial.availableYield + tickData.amountToAccrue
    tickData.totalYield = tickData.totalYield + tickData.amountToAccrue

    // Compute amounts
    try {
      const swapAmounts = findOptimalSwapAmounts(
        tickData.final.virtualReserveIn,
        tickData.final.virtualReserveOut,
        tickData.final.availableYield,
        tickData.marketRate,
        _tokenInDecimals,
        _tokenOutDecimals,
        _minimumProfit
      )

      // Swap
      if (swapAmounts?.profitable) {
        try {
          const { AO, AI, VRI, VRO } = swapExactAmountOut(
            tickData.final.virtualReserveIn,
            tickData.final.virtualReserveOut,
            tickData.final.availableYield,
            swapAmounts.amountOut,
            _swapMultiplier,
            _liquidityFraction,
            _minimumK
          )
          tickData.totalAmountOut = tickData.totalAmountOut + AO
          tickData.swap = {
            amountOut: AO,
            amountIn: AI,
            profit: swapAmounts.profit,
            profitable: swapAmounts.profitable,
            swapPercent: swapAmounts.swapPercent,
            marketAmountOut: swapAmounts.marketAmountOut
          }
          tickData.final = {
            virtualReserveIn: VRI,
            virtualReserveOut: VRO,
            availableYield: tickData.final.availableYield - AO
          }
          // Update state
        } catch (e) {
          console.log(e)
        }
      }
      // Log Swap
      simulatedTicks.push({ ...tickData })
    } catch (e) {
      console.log(e)
    }
  }

  console.log({ simulatedTicks })
  return simulatedTicks
}

function findOptimalSwapAmounts(
  virtualReserveIn: bigint,
  virtualReserveOut: bigint,
  availableYield: bigint,
  marketRate: bigint,
  tokenInDecimals: number,
  tokenOutDecimals: number,
  minimumProfit: bigint
) {
  const result = {
    amountOut: BigInt(0),
    amountIn: BigInt(0),
    profit: BigInt(0),
    profitable: false,
    swapPercent: BigInt(0),
    yieldAfterSwap: availableYield,
    marketAmountOut: BigInt(0)
  }
  // steps of 1%
  let stepSize = availableYield / BigInt(100)

  if (stepSize === BigInt(0)) {
    return result
  }

  for (let amountOut = stepSize; amountOut <= availableYield; amountOut += stepSize) {
    try {
      const amountIn = computeExactAmountIn(
        virtualReserveIn,
        virtualReserveOut,
        availableYield,
        amountOut
      )
      const marketAmountOut =
        (amountIn * marketRate) /
        (BigInt(10 ** (tokenInDecimals - tokenOutDecimals)) * BigInt(RATE_SCALAR))
      const profitable = amountOut > marketAmountOut + minimumProfit
      const profit = profitable ? amountOut - marketAmountOut : BigInt(0)

      // // Obviously this is a bit of a kludge... Uncomment this to allow for some random unprofitable trades
      // const r = Math.random()
      // if (!profitable && r < 0.5) {
      //   console.log('UNPROFITABLE TRADE')
      //   result.amountOut = amountOut
      //   result.amountIn = amountIn
      //   result.profit = profit
      //   result.profitable = true
      //   result.swapPercent = (amountOut * BigInt(100)) / availableYield
      //   result.yieldAfterSwap = availableYield - amountOut
      //   result.marketAmountOut = marketAmountOut
      //   break
      // }

      if (profitable && profit > result.profit) {
        result.amountOut = amountOut
        result.amountIn = amountIn
        result.profit = profit
        result.profitable = profitable
        result.swapPercent = (amountOut * BigInt(100)) / availableYield
        result.yieldAfterSwap = availableYield - amountOut
        result.marketAmountOut = marketAmountOut
      }
    } catch (e) {
      console.log(e)
    }
  }

  return result
}
