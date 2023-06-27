import { useAtom } from 'jotai'
import { useMemo } from 'react'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart
} from 'recharts'
import { chartDataAtom, hasSimulatedStateAtom, isSimulatingStateAtom } from './atoms'
import { METRICS } from './hooks/useConfigWatcher'
import { ChartData } from './interfaces'

const LINE_CHARTS = [
  [METRICS.finalVirtualReserveIn, METRICS.finalVirtualReserveOut],
  [
    METRICS.marketRate,
    METRICS.finalLiquidatorRate,
    // METRICS.initialLiquidatorRate,
    METRICS.swapRate
  ],
  // [METRICS.amountOut, METRICS.amountIn, METRICS.marketAmountOut],
  [METRICS.totalAmountOut, METRICS.totalYield]
  // [METRICS.amountOut, METRICS.marketAmountOut]
]
const BAR_CHARTS = [
  [METRICS.amountOut, METRICS.marketAmountOut],
  [METRICS.swapPercent],
  [METRICS.profit],
  [METRICS.marketRate, METRICS.swapRate]
]
const AREA_CHARTS = [[METRICS.yieldArea]]

export const SimulationCharts: React.FC = () => {
  const [chartData] = useAtom(chartDataAtom)
  const [isSimulating] = useAtom(isSimulatingStateAtom)
  const [hasSimulated] = useAtom(hasSimulatedStateAtom)

  if (isSimulating) {
    return <div>Simulating...</div>
  }

  if (!hasSimulated) {
    return <div>Simulate to see results</div>
  }

  return (
    <div className='grid grid-cols-1 gap-8'>
      <AveragePercentageSwapped />
      {LINE_CHARTS.map((metrics, i) => (
        <PtLineChart key={`chart-${i}`} chartData={chartData} metrics={metrics} />
      ))}
      <AprAndTvlChart data={chartData} />
      {BAR_CHARTS.map((metrics, i) => (
        <PtBarChart key={`chart-${i}`} chartData={chartData} metrics={metrics} />
      ))}
      {AREA_CHARTS.map((metrics, i) => (
        <PtAreaChart key={`chart-${i}`} chartData={chartData} metrics={metrics} />
      ))}
    </div>
  )
}

const PtLineChart = (props: {
  chartData: ChartData[]
  metrics: { dataKey: string; name?: string }[]
}) => {
  return (
    <ResponsiveContainer width='100%' height={400} className='mx-auto'>
      <LineChart data={props.chartData}>
        <CartesianGrid stroke='#cccccc11' />
        <Tooltip />
        <XAxis />
        <YAxis />
        <Legend />
        {props.metrics.map((line, i) => {
          return (
            <Line
              dot={false}
              key={`line-${i}-${line.dataKey}`}
              type='monotone'
              dataKey={line.dataKey}
              name={line?.name}
              stroke={LINE_COLOURS[i % LINE_COLOURS.length]}
            />
          )
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}

const PtBarChart = (props: {
  chartData: ChartData[]
  metrics: { dataKey: string; name?: string }[]
}) => {
  return (
    <ResponsiveContainer width='100%' height={400} className='mx-auto'>
      <BarChart data={props.chartData}>
        <CartesianGrid stroke='#cccccc11' />
        <XAxis />
        <YAxis />
        <Tooltip />
        <Legend />
        {props.metrics.map((line, i) => {
          return (
            <Bar
              key={`line-${i}-${line.dataKey}`}
              type='monotone'
              dataKey={line.dataKey}
              name={line?.name}
              stroke={LINE_COLOURS[i % LINE_COLOURS.length]}
              fill={LINE_COLOURS[i % LINE_COLOURS.length]}
            />
          )
        })}
      </BarChart>
    </ResponsiveContainer>
  )
}

const PtAreaChart = (props: {
  chartData: ChartData[]
  metrics: { dataKey: string; name?: string }[]
}) => {
  return (
    <ResponsiveContainer width='100%' height={400} className='mx-auto'>
      <AreaChart
        data={props.chartData}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }}
      >
        <CartesianGrid stroke='#cccccc11' />
        <XAxis />
        <YAxis />
        <Tooltip />
        <Legend />
        {props.metrics.map((line, i) => {
          return (
            <Area
              key={`line-${i}-${line.dataKey}`}
              type='monotone'
              dataKey={line.dataKey}
              name={line?.name}
              stroke={LINE_COLOURS[i % LINE_COLOURS.length]}
              fill={LINE_COLOURS[i % LINE_COLOURS.length]}
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// An assortment of colours that contrast well with each other and with purple
const LINE_COLOURS = [
  '#17e1fd',
  '#ff77e1',
  '#ffed47',
  '#27cc1f',
  '#82ca9d',
  '#8884d8',
  '#ffc658',
  '#8811d8'
]

// const SwapPercentChart = (props: { data: ChartData[] }) => (
//   <ResponsiveContainer width='100%' height={400} className='mx-auto'>
//     <BarChart {...props}>
//       <XAxis />
//       <YAxis />
//       <Tooltip />
//       <Legend />
//     </BarChart>
//   </ResponsiveContainer>
// )

// const YieldAreaChart = (props: { data: ChartData[] }) => (
//   <ResponsiveContainer width='100%' height={400} className='mx-auto'>
//     <AreaChart
//       {...props}
//       margin={{
//         top: 20,
//         right: 20,
//         bottom: 20,
//         left: 20
//       }}
//     >
//       <XAxis />
//       <YAxis />
//       <Area stroke={LINE_COLOURS[2]} fill={LINE_COLOURS[2]} />
//       <Tooltip />
//       <Legend />
//     </AreaChart>
//   </ResponsiveContainer>
// )

const AprAndTvlChart = (props: { data: ChartData[] }) => (
  <ResponsiveContainer width='100%' height={400}>
    <LineChart {...props}>
      <CartesianGrid stroke='#cccccc11' />
      <XAxis />
      <YAxis yAxisId='left' />
      <YAxis yAxisId='right' orientation='right' />
      <Tooltip />
      <Legend />
      <Line
        dot={false}
        yAxisId='right'
        type='monotone'
        name='APR'
        dataKey='yearlyApr'
        stroke={LINE_COLOURS[0]}
      />

      <Line
        dot={false}
        yAxisId='left'
        type='monotone'
        name={METRICS.totalYield.name}
        dataKey={METRICS.totalYield.dataKey}
        stroke={LINE_COLOURS[1]}
      />
      <Line
        dot={false}
        yAxisId='left'
        type='monotone'
        name={METRICS.amountToAccrue.name}
        dataKey={METRICS.amountToAccrue.dataKey}
        stroke={LINE_COLOURS[2]}
      />
    </LineChart>
  </ResponsiveContainer>
)

const AveragePercentageSwapped = () => {
  const [chartData] = useAtom(chartDataAtom)
  const data = useMemo(() => {
    let countOfSwaps = 0
    let firstSwapTick = null
    const total = chartData.reduce((avg, data, i) => {
      const amt = Number(data['swap-swapPercent'])

      if (amt > 0) {
        countOfSwaps += 1
        if (firstSwapTick === null) {
          firstSwapTick = i
        }
      }
      return avg + amt
    }, 0)
    const avg = total / chartData.length
    const avgOfSwaps = total / countOfSwaps
    return { avg, avgOfSwaps, firstSwapTick }
  }, [chartData])
  return (
    <div>
      <p className='text-xs'>Average Percentage Swapped Per Tick: {data.avg || '--'}%</p>
      <p className='text-xs'>Average Percentage Swapped Per Swap: {data.avgOfSwaps || '--'}%</p>
      <p className='text-xs'>First Swap Tick: {data.firstSwapTick || '--'}</p>
    </div>
  )
}
