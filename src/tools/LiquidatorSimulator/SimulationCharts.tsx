import { useAtom } from 'jotai'
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
import { ChartData } from './interfaces'

const METRICS = {
  initialVirtualReserveIn: {
    dataKey: 'initial-virtualReserveIn',
    name: 'Initial Virtual Reserve In'
  },
  yearlyApr: {
    dataKey: 'yearlyApr',
    name: 'APR'
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
  marketRate: {
    dataKey: 'marketRate',
    name: 'Market Rate'
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

const LINE_CHARTS = [
  [METRICS.finalVirtualReserveIn, METRICS.finalVirtualReserveOut],
  [METRICS.amountOut, METRICS.amountIn, METRICS.marketAmountOut],
  [METRICS.amountOut, METRICS.marketAmountOut],
  [METRICS.totalAmountOut, METRICS.totalYield]
]
const BAR_CHARTS = [
  [METRICS.swapPercent],
  [METRICS.amountOut, METRICS.amountIn, METRICS.marketAmountOut]
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
      {LINE_CHARTS.map((metrics, i) => (
        <PtLineChart key={`chart-${i}`} chartData={chartData} metrics={metrics} />
      ))}
      {BAR_CHARTS.map((metrics, i) => (
        <PtBarChart key={`chart-${i}`} chartData={chartData} metrics={metrics} />
      ))}
      {AREA_CHARTS.map((metrics, i) => (
        <PtAreaChart key={`chart-${i}`} chartData={chartData} metrics={metrics} />
      ))}
      <AprAndTvlChart data={chartData} />
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

const SwapPercentChart = (props: { data: ChartData[] }) => (
  <ResponsiveContainer width='100%' height={400} className='mx-auto'>
    <BarChart {...props}>
      <XAxis />
      <YAxis />
      <Tooltip />
      <Legend />
    </BarChart>
  </ResponsiveContainer>
)

const YieldAreaChart = (props: { data: ChartData[] }) => (
  <ResponsiveContainer width='100%' height={400} className='mx-auto'>
    <AreaChart
      {...props}
      margin={{
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }}
    >
      <XAxis />
      <YAxis />
      <Area stroke={LINE_COLOURS[2]} fill={LINE_COLOURS[2]} />
      <Tooltip />
      <Legend />
    </AreaChart>
  </ResponsiveContainer>
)

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
        yAxisId='right'
        type='monotone'
        name='APR'
        dataKey='yearlyApr'
        stroke={LINE_COLOURS[0]}
      />
      <Line yAxisId='left' type='monotone' name='TVL' dataKey='tvl' stroke={LINE_COLOURS[1]} />
      {/* <Line
        yAxisId='left'
        type='monotone'
        name='Yield'
        dataKey='amountToAccrue'
        stroke={LINE_COLOURS[2]}
      /> */}
    </LineChart>
  </ResponsiveContainer>
)
