import { useAtom } from 'jotai'
import { useEffect } from 'react'
import {
  chartDataAtom,
  SimulatorConfigAtom,
  isSimulatingStateAtom,
  hasSimulatedStateAtom
} from '../atoms'
import { ChartData, SimulatedTick, SimulatorConfig } from '../interfaces'
import { RATE_SCALAR, simulateSwapExactAmountOut } from '../utils/simulator'

/**
 * Should match what the simulation data gets translated to
 */
export const METRICS = {
  finalK: {
    dataKey: 'finalK',
    name: 'K'
  },
  initialVirtualReserveIn: {
    dataKey: 'initial-virtualReserveIn',
    name: 'Initial Virtual Reserve In'
  },
  yearlyApr: {
    dataKey: 'yearlyApr',
    name: 'APR'
  },
  amountToAccrue: {
    dataKey: 'amountToAccrue',
    name: 'Yield Earned'
  },
  finalVirtualReserveIn: {
    dataKey: 'initial-virtualReserveIn',
    name: 'Virtual Reserve In'
  },
  initialVirtualReserveOut: {
    dataKey: 'initial-virtualReserveOut',
    name: 'Initial Virtual Reserve Out'
  },
  finalVirtualReserveOut: {
    dataKey: 'final-virtualReserveOut',
    name: 'Virtual Reserve Out'
  },
  initialAvailableYield: {
    dataKey: 'initial-availableYield',
    name: 'Available Yield'
  },
  finalAvailableYield: {
    dataKey: 'final-availableYield',
    name: 'Available Yield'
  },
  marketAmountOut: {
    dataKey: 'swap-marketAmountOut',
    name: 'Market Amount Out'
  },
  totalAmountOut: {
    dataKey: 'totalAmountOut',
    name: 'Total Amount Out'
  },
  totalYield: {
    dataKey: 'totalYield',
    name: 'Total Yield Earned'
  },
  amountOut: {
    dataKey: 'swap-amountOut',
    name: 'Amount Out'
  },
  amountIn: {
    dataKey: 'swap-amountIn',
    name: 'Amount In'
  },
  swapPercent: {
    dataKey: 'swap-swapPercent',
    name: 'Percentage of Yield Swapped'
  },
  swapRate: {
    dataKey: 'swap-executionRate',
    name: 'Execution Rate'
  },
  // X token out per 1 token in
  marketRate: {
    dataKey: 'marketRate',
    name: 'Market Rate'
  },
  // X token out per 1 token in
  initialLiquidatorRate: {
    dataKey: 'initial-liquidatorRate',
    name: 'Initial Liquidator Rate'
  },
  finalLiquidatorRate: {
    dataKey: 'final-liquidatorRate',
    name: 'Final Liquidator Rate'
  },
  profit: {
    dataKey: 'swap-profit',
    name: 'Profit'
  },
  yieldArea: {
    dataKey: 'yield-area',
    name: 'Available Yield Post Swap'
  }
}

export const useConfigWatcher = () => {
  const [config] = useAtom(SimulatorConfigAtom)
  const [, setChartData] = useAtom(chartDataAtom)
  const [, setIsSimulatingStateAtom] = useAtom(isSimulatingStateAtom)
  const [, setHasSimulatedStateAtom] = useAtom(hasSimulatedStateAtom)

  useEffect(() => {
    if (!config) return
    setIsSimulatingStateAtom(true)
    setChartData(formatSimulatedTickToChartData(simulateSwapExactAmountOut(config), config))
    setIsSimulatingStateAtom(false)
    setHasSimulatedStateAtom(true)
  }, [config])
}

function formatSimulatedTickToChartData(
  simulatedTicks: SimulatedTick[],
  config: SimulatorConfig
): ChartData[] {
  const chartData: ChartData[] = simulatedTicks.map((data) => ({
    'amountToAccrue': toToken(data.amountToAccrue, config.tokenOutDecimals),
    'marketRate': div(data.marketRate, RATE_SCALAR),
    'yearlyApr': Number(data.yearlyApr) / RATE_SCALAR,
    'tvl': toToken(data.tvl, config.tokenOutDecimals),
    'initial-virtualReserveIn': toToken(data.initial.virtualReserveIn, config.tokenInDecimals),
    'initial-virtualReserveOut': toToken(data.initial.virtualReserveOut, config.tokenOutDecimals),
    'initial-availableYield': toToken(data.initial.availableYield, config.tokenOutDecimals),
    'initial-liquidatorRate': div(data.initial.liquidatorRate, RATE_SCALAR),
    'totalAmountOut': toToken(data.totalAmountOut, config.tokenOutDecimals),
    'totalYield': toToken(data.totalYield, config.tokenOutDecimals),
    'swap-amountOut': toToken(data.swap.amountOut, config.tokenOutDecimals),
    'swap-amountIn': toToken(data.swap.amountIn, config.tokenInDecimals),
    'swap-profit': toToken(data.swap.profit, config.tokenOutDecimals),
    'swap-profitable': data.swap.profitable ? 1 : 0,
    'swap-swapPercent': Number(data.swap.swapPercent),
    'swap-executionRate':
      data.swap.executionRate > 0 ? div(data.swap.executionRate, RATE_SCALAR) : null,
    'swap-marketAmountOut': toToken(data.swap.marketAmountOut, config.tokenOutDecimals),
    'final-virtualReserveIn': toToken(data.final.virtualReserveIn, config.tokenInDecimals),
    'final-virtualReserveOut': toToken(data.final.virtualReserveOut, config.tokenOutDecimals),
    'final-k': String(data.final.virtualReserveOut * data.final.virtualReserveIn),
    'final-availableYield': toToken(data.final.availableYield, config.tokenOutDecimals),
    'final-liquidatorRate': div(data.final.liquidatorRate, RATE_SCALAR),
    'yield-area': [
      toToken(data.amountToAccrue + data.initial.availableYield, config.tokenOutDecimals),
      toToken(data.swap.amountOut, config.tokenOutDecimals)
    ]
  }))

  console.log({ chartData })
  return chartData
}

// // Maintain BigInt
// function toToken(x: bigint, decimals: number) {
//   return div(x, 10 ** decimals)
// }

// function div(x: bigint, y: number) {
//   return Number(x / BigInt(y))
// }

function toToken(x: bigint, decimals: number) {
  return div(x, 10 ** decimals)
}

function div(x: bigint, y: number) {
  return Number(x) / y
}
