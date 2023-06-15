export interface ChartData {
  'amountToAccrue': number
  'marketRate': number
  'yearlyApr': number
  'initial-virtualReserveIn': number
  'initial-virtualReserveOut': number
  'initial-availableYield': number
  'initial-liquidatorRate': number
  'totalAmountOut': number
  'totalYield': number
  'swap-amountOut': number
  'swap-amountIn': number
  'swap-profit': number
  'swap-profitable': number
  'swap-swapPercent': number
  'swap-marketAmountOut': number
  'swap-executionRate': number
  'final-virtualReserveIn': number
  'final-virtualReserveOut': number
  'final-availableYield': number
  'final-liquidatorRate': number
}

export enum ChaosLevel {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface SimulatedTick {
  amountToAccrue: bigint
  marketRate: bigint
  yearlyApr: bigint
  tvl: bigint
  totalAmountOut: bigint
  totalYield: bigint
  initial: {
    virtualReserveIn: bigint
    virtualReserveOut: bigint
    availableYield: bigint
    liquidatorRate: bigint
  }
  swap: {
    amountOut: bigint
    amountIn: bigint
    profit: bigint
    profitable: boolean
    swapPercent: bigint
    executionRate: bigint
    marketAmountOut: bigint
  }
  final: {
    virtualReserveIn: bigint
    virtualReserveOut: bigint
    availableYield: bigint
    liquidatorRate: bigint
  }
}

export interface SimulatorConfig {
  ticks: number
  tickLength: number
  virtualReserveIn: bigint
  virtualReserveOut: bigint
  tokenInDecimals: number
  tokenOutDecimals: number
  totalValueLockedOut: bigint
  swapMultiplier: bigint
  liquidityFraction: bigint
  minimumK: bigint // Swap amount going out
  minimumProfit: bigint
  marketRates: { time: number; rate: bigint }[]
  yieldYearlyAprRates: { time: number; rate: bigint }[]
  chaosLevel: ChaosLevel // Amount of randomness to indroduce into the simulation
}
