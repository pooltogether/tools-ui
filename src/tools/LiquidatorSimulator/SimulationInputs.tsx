import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import { SimulatorConfigAtom } from './atoms'
import { ChaosLevel, SimulatorConfig } from './interfaces'
import { applyRandomScaling, randomNumber, randomWithSeed } from './utils/randomNumber'
import { RATE_SCALAR } from './utils/simulator'

const FORM: {
  name: string
  type: 'number' | 'text'
  id:
    | 'ticks'
    | 'tickLength'
    | 'tokenInDecimals'
    | 'tokenOutDecimals'
    | 'virtualReserveIn'
    | 'virtualReserveOut'
    | 'totalValueLockedOut'
    | 'swapMultiplier'
    | 'liquidityFraction'
    | 'minimumK'
    | 'minimumProfit'
    | 'marketRate'
    | 'yieldYearlyAprRate'
    | 'chaosLevel'
  defaultValue?: string
}[] = [
  {
    id: 'ticks',
    name: 'Number of ticks',
    defaultValue: '168', // 1 week
    type: 'text'
  },
  {
    id: 'tickLength',
    name: 'Tick Length (hours)',
    defaultValue: '1', // Hours
    type: 'text'
  },
  { id: 'tokenInDecimals', name: 'Token In decimals', defaultValue: '18', type: 'text' },
  { id: 'tokenOutDecimals', name: 'Token Out Decimals', defaultValue: '18', type: 'text' },
  {
    id: 'virtualReserveIn',
    name: 'Virtual Reserve of Token In',
    defaultValue: '55000',
    type: 'text'
  },
  {
    id: 'virtualReserveOut',
    name: 'Virtual Reserve of Token Out',
    defaultValue: '55000',
    type: 'text'
  },
  {
    id: 'totalValueLockedOut',
    name: 'TVL of Token Out',
    defaultValue: '10000000', // 10m
    type: 'text'
  },
  {
    id: 'swapMultiplier',
    name: 'Swap Multiplier',
    defaultValue: '0.3', // Apply 30% more pressure on the swap
    type: 'text'
  },
  {
    id: 'liquidityFraction',
    name: 'Liquidity Fraction',
    defaultValue: '0.02', // Set virtual reserves to 2% of the yield
    type: 'text'
  },
  {
    id: 'minimumK',
    name: 'Minimum K',
    defaultValue: '100000', // Minimum K. x*y=k
    type: 'text'
  },
  {
    id: 'minimumProfit',
    name: 'Minimum Profit of Token Out',
    defaultValue: '1', // Minimum amount of token out to commit to a swap
    type: 'text'
  },
  {
    id: 'marketRate',
    name: 'Market Rate of Token Out denominated in Token In',
    defaultValue: '1', // X token out per 1 token in
    type: 'text'
  },
  {
    id: 'yieldYearlyAprRate',
    name: 'Yearly APR',
    defaultValue: '0.05', // % of interest earned linearlly on TVL in a year. Scaled down and distributed daily.
    type: 'text'
  }
]

interface FormData {
  ticks: string
  tickLength: string
  tokenInDecimals: string
  tokenOutDecimals: string
  virtualReserveIn: string
  virtualReserveOut: string
  totalValueLockedOut: string
  swapMultiplier: string
  liquidityFraction: string
  minimumK: string
  minimumProfit: string
  marketRate: string
  yieldYearlyAprRate: string
  chaosLevel: string
}

export const SimulationInputs: React.FC = () => {
  const [config, setConfig] = useAtom(SimulatorConfigAtom)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>()
  const onSubmit = (data) => {
    // TODO: Validate data
    try {
      const validatedData: FormData = data
      console.log({ validatedData })
      const config = formatFormDataToSimulatorConfig(validatedData)
      console.log({ config })
      setConfig(config)
    } catch (e) {
      console.error('Error validating data', e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-col space-y-2'>
        {FORM.map((formItem, i) => (
          <div key={`form-item-${i}`} className='grid grid-cols-2 gap-2'>
            <label htmlFor={formItem.id}>{formItem.name}</label>
            <div className='grid grid-cols-1'>
              <input
                id={formItem.id}
                defaultValue={formItem?.defaultValue}
                {...register(formItem.id, { required: true })}
              />
              {!!errors[formItem.id] && (
                <span className='text-red'>{errors[formItem.id]?.message || 'Error'}</span>
              )}
            </div>
          </div>
        ))}
        <div className='grid grid-cols-2 gap-2'>
          <label htmlFor='chaosLevel'>Chaos</label>
          <select id={'chaosLevel'} {...register('chaosLevel', { required: true })}>
            <option value={ChaosLevel.None}>None</option>
            <option value={ChaosLevel.Low}>Low</option>
            <option value={ChaosLevel.Medium}>Medium</option>
            <option value={ChaosLevel.High}>High</option>
          </select>
          {!!errors.chaosLevel && (
            <span className='text-red'>{errors.chaosLevel?.message || 'Error'}</span>
          )}
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <p className='text-xxs opacity-80'>
          Note: All token amounts will be scaled according to the token decimals provided
        </p>
        <Button
          type='button'
          theme={ButtonTheme.purpleOutline}
          size={ButtonSize.sm}
          className='col-span-2 mt-2 ml-auto'
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(serializeBigInts(config)))
          }}
        >
          Copy Config
        </Button>
      </div>
      <Button type='submit' className='col-span-2 mt-6 w-full'>
        Simulate
      </Button>
    </form>
  )
}

// Given a bigint and a Chaos level, randomly increase by plus or minus 1 percent
function computeRates(ticks: string, marketRate: string, apr: string, chaosLevel: ChaosLevel) {
  const marketRates: { time: number; rate: bigint }[] = []
  const yieldYearlyAprRates: { time: number; rate: bigint }[] = []
  for (let i = 0; i < Number(ticks); i++) {
    let _marketRate = BigInt(Math.floor(Number(marketRate) * RATE_SCALAR))
    let _apr = BigInt(Math.floor(Number(apr) * RATE_SCALAR))

    const scaledMarketRate = applyRandomScaling(_marketRate, i, chaosLevel)
    const scaledApr = applyRandomScaling(_apr, i, chaosLevel)

    _marketRate = scaledMarketRate > BigInt(0) ? scaledMarketRate : BigInt(0)
    _apr = scaledApr > BigInt(0) ? scaledApr : BigInt(0)

    marketRates.push({
      time: i,
      rate: _marketRate
    })
    yieldYearlyAprRates.push({
      time: i,
      rate: _apr
    })
  }
  return { marketRates, yieldYearlyAprRates }
}

function formatFormDataToSimulatorConfig(config: FormData): SimulatorConfig {
  const { marketRates, yieldYearlyAprRates } = computeRates(
    config.ticks,
    config.marketRate,
    config.yieldYearlyAprRate,
    config.chaosLevel as ChaosLevel
  )

  return {
    ticks: Number(config.ticks),
    tickLength: Number(config.tickLength),
    tokenInDecimals: Number(config.tokenInDecimals),
    tokenOutDecimals: Number(config.tokenOutDecimals),
    virtualReserveIn:
      BigInt(config.virtualReserveIn) * BigInt(10 ** Number(config.tokenInDecimals)),
    virtualReserveOut:
      BigInt(config.virtualReserveOut) * BigInt(10 ** Number(config.tokenOutDecimals)),
    totalValueLockedOut:
      BigInt(config.totalValueLockedOut) * BigInt(10 ** Number(config.tokenOutDecimals)),
    swapMultiplier: BigInt(Number(config.swapMultiplier) * RATE_SCALAR),
    liquidityFraction: BigInt(Number(config.liquidityFraction) * RATE_SCALAR),
    minimumK: BigInt(config.minimumK),
    minimumProfit: BigInt(Number(config.minimumProfit) * 10 ** Number(config.tokenOutDecimals)),
    marketRates,
    yieldYearlyAprRates,
    chaosLevel: config.chaosLevel as ChaosLevel
  }
}

function serializeBigInts(obj: object) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    if (typeof value === 'bigint') {
      acc[key] = value.toString()
    } else if (typeof value === 'object') {
      acc[key] = serializeBigInts(value)
    } else {
      acc[key] = value
    }
    return acc
  }, {})
}
