import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { FieldErrors, UseFormRegister, useForm, useFieldArray, Control } from 'react-hook-form'
import { SimulatorConfigAtom } from './atoms'
import { ChaosLevel, SimulatorConfig } from './interfaces'
import { applyRandomScaling, randomNumber, randomWithSeed } from './utils/randomNumber'
import { RATE_SCALAR } from './utils/simulator'

const SIMULATION_CONFIG: {
  name: string
  type: 'number' | 'text'
  id: string
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
    id: 'totalValueLockedOut',
    name: 'TVL of Token Out',
    defaultValue: '10000000', // 10m
    type: 'text'
  },
  {
    id: 'minimumProfit',
    name: 'Minimum Profit of Token Out',
    defaultValue: '1', // Minimum amount of token out to commit to a swap
    type: 'text'
  }
]

const ARRAY_FORM_FIELDS: {
  name: string
  type: 'number' | 'text'
  id: string
  defaultValue?: string
}[] = [
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

const LIQUIDATION_PAIR_CONFIG: {
  name: string
  type: 'number' | 'text'
  id: string
  defaultValue?: string
}[] = [
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
  marketRate: {
    time: string
    value: string
  }[]
  yieldYearlyAprRate: {
    time: string
    value: string
  }[]
  chaosLevel: string
}

export const SimulationInputs: React.FC = () => {
  const [config, setConfig] = useAtom(SimulatorConfigAtom)
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      marketRate: [{ time: '0', value: '1' }],
      yieldYearlyAprRate: [{ time: '0', value: '0.05' }]
    }
  })
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
        <p className='font-bold text-lg mt-2 '>Simulation Configuration</p>
        <div className='flex flex-col space-y-2 p-2 bg-actually-black bg-opacity-10 rounded'>
          {SIMULATION_CONFIG.map((formItem, i) => (
            <TextFormRow
              {...formItem}
              key={`${formItem.id}-${i}`}
              register={register}
              errors={errors}
            />
          ))}
        </div>

        <p className='font-bold text-lg mt-2'>Liquidation Pair Configuration</p>
        <div className='flex flex-col space-y-2 p-2  bg-actually-black bg-opacity-10 rounded'>
          {LIQUIDATION_PAIR_CONFIG.map((formItem, i) => (
            <TextFormRow
              {...formItem}
              key={`${formItem.id}-${i}`}
              register={register}
              errors={errors}
            />
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
            {ARRAY_FORM_FIELDS.map((formItem, i) => (
              <ArrayFormRow
                {...formItem}
                key={`${formItem.id}-${i}`}
                register={register}
                errors={errors}
                control={control}
              />
            ))}
          </div>
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
function computeRates(
  ticks: string,
  mrs: { time: string; value: string }[],
  aprs: { time: string; value: string }[],
  chaosLevel: ChaosLevel
) {
  const marketRates: { time: number; rate: bigint }[] = []
  const yieldYearlyAprRates: { time: number; rate: bigint }[] = []

  let _marketRate = BigInt(Math.floor(Number(mrs[0].value) * RATE_SCALAR))
  let _apr = BigInt(Math.floor(Number(aprs[0].value) * RATE_SCALAR))

  for (let i = 0; i < Number(ticks); i++) {
    let __marketRate = mrs.find((mr) => mr.time === i.toString())?.value
    let __apr = aprs.find((apr) => apr.time === i.toString())?.value

    if (!!__marketRate) {
      _marketRate = BigInt(Math.floor(Number(__marketRate) * RATE_SCALAR))
    }
    if (!!__apr) {
      _apr = BigInt(Math.floor(Number(__apr) * RATE_SCALAR))
    }

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

const TextFormRow = (props: {
  name: string
  type: 'number' | 'text'
  id: string
  defaultValue?: string
  register: UseFormRegister<FormData>
  errors: FieldErrors
}) => {
  const { name, type, id, defaultValue, register, errors } = props
  return (
    <div className='grid grid-cols-2 gap-2'>
      <label htmlFor={id}>{name}</label>
      <div className='grid grid-cols-1'>
        <input
          id={id}
          defaultValue={defaultValue}
          type={type}
          {...register(id, { required: true })}
        />
        {!!errors[id] && <span className='text-red'>{errors[id]?.message || 'Error'}</span>}
      </div>
    </div>
  )
}

const ArrayFormRow = (props: {
  name: string
  type: 'number' | 'text'
  id: string
  defaultValue?: string
  errors: FieldErrors
  register: UseFormRegister<FormData>
  control: Control<FormData>
}) => {
  const { register, control, name, type, id, defaultValue } = props

  const { fields, append, remove } = useFieldArray({
    control,
    name: id
  })

  return (
    <>
      <div>{name}</div>
      <ul className='grid gap-2'>
        {fields.map((field, index) => (
          <li key={field.id} className='bg-actually-black bg-opacity-10 rounded p-2'>
            <div className='flex justify-between'>
              <span>{index + 1}</span>
              {index !== 0 && (
                <Button
                  theme={ButtonTheme.orangeOutline}
                  size={ButtonSize.sm}
                  type='button'
                  className='h-fit-content'
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className='grid grid-cols-2 gap-1'>
              <div>
                <div>
                  <label htmlFor={`${id}.${index}.time`}>Time</label>
                  <input
                    defaultValue={0}
                    type={'string'}
                    {...register(`${id}.${index}.time` as const)}
                  />
                </div>
                <div>
                  <label htmlFor={`${id}.${index}.value`}>Value</label>
                  <input
                    defaultValue={defaultValue}
                    type={type}
                    {...register(`${id}.${index}.value` as const)}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
        <Button
          size={ButtonSize.sm}
          className='h-fit-content w-full'
          type='button'
          onClick={() => {
            append({ time: '', value: '' })
          }}
        >
          Add
        </Button>
      </ul>
    </>
  )
}
