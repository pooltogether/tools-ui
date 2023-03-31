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
    'totalAmountOut': toToken(data.totalAmountOut, config.tokenOutDecimals),
    'totalYield': toToken(data.totalYield, config.tokenOutDecimals),
    'swap-amountOut': toToken(data.swap.amountOut, config.tokenOutDecimals),
    'swap-amountIn': toToken(data.swap.amountIn, config.tokenInDecimals),
    'swap-profit': toToken(data.swap.profit, config.tokenOutDecimals),
    'swap-profitable': data.swap.profitable ? 1 : 0,
    'swap-swapPercent': Number(data.swap.swapPercent),
    'swap-marketAmountOut': toToken(data.swap.marketAmountOut, config.tokenOutDecimals),
    'final-virtualReserveIn': toToken(data.final.virtualReserveIn, config.tokenInDecimals),
    'final-virtualReserveOut': toToken(data.final.virtualReserveOut, config.tokenOutDecimals),
    'final-availableYield': toToken(data.final.availableYield, config.tokenOutDecimals),
    'yield-area': [
      toToken(data.amountToAccrue + data.initial.availableYield, config.tokenOutDecimals),
      toToken(data.swap.amountOut, config.tokenOutDecimals)
    ]
  }))

  console.log({ chartData })
  return chartData
}

function toToken(x: bigint, decimals: number) {
  return div(x, 10 ** decimals)
}

function div(x: bigint, y: number) {
  return Number(x / BigInt(y))
}
