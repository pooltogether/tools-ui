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

const LINES = {
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
    name: 'Swao Percent'
  },
  marketRate: {
    dataKey: 'marketRate',
    name: 'Market Rate'
  },
  profit: {
    dataKey: 'swap-profit',
    name: 'Profit'
  }
}

const CHARTS = [
  // [{ dataKey: 'uv', name: 'YEWVEE' }, { dataKey: 'pv' }, { dataKey: 'amt' }],
  // [{ dataKey: 'uv' }, { dataKey: 'pv' }, { dataKey: 'amt' }]
  [LINES.finalVirtualReserveIn, LINES.finalVirtualReserveOut],
  [LINES.amountOut, LINES.amountIn, LINES.marketAmountOut],
  [LINES.amountOut, LINES.marketAmountOut],
  [LINES.amountOut, LINES.amountIn],
  [LINES.totalAmountOut, LINES.totalYield]
]

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

  // return (
  //   <ResponsiveContainer width='90%' height={300}>
  //     <LineChart data={testData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
  //       <Line type='monotone' dataKey='uv' stroke='#00FFFF' />
  //       <Line type='monotone' dataKey='pv' stroke='#FF00ff' />
  //       <Line type='monotone' dataKey='amt' stroke='#FFFF00' />
  //       <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
  //       <XAxis />
  //       <YAxis />
  //       <Tooltip />
  //       <Legend verticalAlign='top' height={36} />
  //     </LineChart>
  //   </ResponsiveContainer>
  // )

  return (
    <div className='grid grid-cols-1 gap-8'>
      {CHARTS.map((lines, i) => (
        <LiquidatorChart key={`chart-${i}`} chartData={chartData} lines={lines} />
      ))}

      <SwapPercentChart data={chartData} />
      <YieldAreaChart data={chartData} />
      <AprAndTvlChart data={chartData} />
    </div>
  )
}

const LiquidatorChart = (props: {
  chartData: ChartData[]
  lines: { dataKey: string; name?: string }[]
}) => {
  return (
    <ResponsiveContainer width='100%' height={400} className='mx-auto'>
      <LineChart data={props.chartData}>
        {props.lines.map((line, i) => {
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
        <CartesianGrid stroke='#cccccc11' />
        <Tooltip />
        <XAxis />
        <YAxis />
        <Legend />
      </LineChart>
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
      <Bar dataKey='swap-swapPercent' name='Percentage of Yield Swapped' fill={LINE_COLOURS[0]} />
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
      <Area
        dataKey='yield-area'
        name='Available Yield Post Swap'
        stroke={LINE_COLOURS[2]}
        fill={LINE_COLOURS[2]}
      />
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
