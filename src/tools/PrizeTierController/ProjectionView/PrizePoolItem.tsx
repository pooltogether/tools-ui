import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { calculate } from '@pooltogether/v4-utils-js'
import { allCombinedPrizeTiersAtom, isListCollapsed } from '@prizeTierController/atoms'
import { usePrizePoolTvl } from '@prizeTierController/hooks/usePrizePoolTvl'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import {
  PrizeTierConfigV2,
  PrizeTierHistoryContract,
  ProjectionSettings
} from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { calculateDprMultiplier } from '@prizeTierController/utils/calculateDprMultiplier'
import { calculateEstimatedTimeFromPrizeChance } from '@prizeTierController/utils/calculateEstimatedTimeFromPrizeChance'
import { formatPrettyPercentage } from '@prizeTierController/utils/formatPrettyPercentage'
import { getTimeBasedDrawValue } from '@prizeTierController/utils/formatTimeBasedDrawValue'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'
import { FieldErrorsImpl, useForm, UseFormRegister, UseFormSetValue } from 'react-hook-form'

// TODO: localization

export const PrizePoolItem = (props: {
  prizePool: PrizePool
  prizeTierHistoryContract: PrizeTierHistoryContract
}) => {
  const { prizePool, prizeTierHistoryContract } = props
  const [combinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)
  const { data: upcomingPrizeTier, isFetched } = usePrizeTierHistoryData(prizeTierHistoryContract)
  const { t } = useTranslation()

  const prizeTier = useMemo(() => {
    if (!!prizePool && !!prizeTierHistoryContract && !!combinedPrizeTiers) {
      const editedPrizeTier =
        combinedPrizeTiers[prizePool.chainId]?.[prizeTierHistoryContract.address]
      if (!!editedPrizeTier) {
        return editedPrizeTier
      } else if (isFetched) {
        return upcomingPrizeTier
      }
    }
  }, [prizePool, prizeTierHistoryContract, combinedPrizeTiers, isFetched])

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      <PrizeTierHistoryTitle prizeTierHistoryContract={prizeTierHistoryContract} className='mb-4' />
      {!!prizeTier ? (
        <PrizePoolProjections
          prizePool={prizePool}
          prizeTierHistoryContract={prizeTierHistoryContract}
          prizeTier={prizeTier}
          defaultFormValues={{ tvl: '0', variance: '0' }}
        />
      ) : (
        t('loading')
      )}
    </li>
  )
}

const PrizePoolProjections = (props: {
  prizePool: PrizePool
  prizeTierHistoryContract: PrizeTierHistoryContract
  prizeTier: PrizeTierConfigV2
  defaultFormValues: ProjectionSettings
}) => {
  const { prizePool, prizeTierHistoryContract, prizeTier, defaultFormValues } = props
  const { data: tvl, isFetched: isFetchedTvl } = usePrizePoolTvl(prizePool)
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProjectionSettings>({
    mode: 'onChange',
    defaultValues: defaultFormValues,
    shouldUnregister: true
  })
  const { t } = useTranslation()

  const formTvl = watch('tvl')
  const parsedFormTvl = parseFloat(formTvl)
  const formVariance = watch('variance')
  const parsedFormVariance = parseFloat(formVariance)

  useEffect(() => {
    if (isFetchedTvl) {
      if (formTvl === '0' || formTvl === undefined) {
        setValue('tvl', tvl.toFixed(0))
      }
    }
  }, [tvl, isFetchedTvl, formTvl, parsedFormTvl])

  const dprMultiplier = !!parsedFormTvl
    ? calculateDprMultiplier(
        prizeTier.dpr,
        parsedFormTvl,
        prizeTier.prize,
        prizeTierHistoryContract.token.decimals
      )
    : 0

  const varianceMultiplier =
    !!parsedFormVariance && parsedFormVariance >= -100 && parsedFormVariance <= 100
      ? 1 + parsedFormVariance / 100
      : 1

  const prizes = prizeTier.tiers.map((tier, i) =>
    parseFloat(
      formatUnits(
        calculate.calculatePrizeForTierPercentage(i, tier, prizeTier.bitRangeSize, prizeTier.prize),
        parseInt(prizeTierHistoryContract.token.decimals)
      )
    )
  )

  const numPrizesPerTier = calculate.calculateNumberOfPrizesPerTier(prizeTier)
  const prizeChances = numPrizesPerTier.map((value) => value * dprMultiplier * varianceMultiplier)
  const expectedNumPrizes = prizeChances.reduce((a, b) => a + b, 0)
  const expectedTierPrizeAmounts = prizes.map((prize, i) => prize * prizeChances[i])
  const expectedPrizeAmount = expectedTierPrizeAmounts.reduce((a, b) => a + b, 0)

  return (
    <>
      {isFetchedTvl ? (
        <>
          <BasicStats
            tvl={parsedFormTvl}
            dpr={prizeTier.dpr}
            token={prizeTierHistoryContract.token}
            className='mb-2'
          />
          <PrizesOverTime
            numPrizes={expectedNumPrizes}
            prizeAmount={expectedPrizeAmount}
            className='mb-2'
          />
          <DrawBreakdown prizes={prizes} prizeChances={prizeChances} className='mb-2' />
          <AdvancedOptions tvl={tvl} errors={errors} register={register} setValue={setValue} />
        </>
      ) : (
        t('loading')
      )}
    </>
  )
}

const BasicStats = (props: { tvl: number; dpr: number; token: Token; className?: string }) => {
  const { tvl, dpr, token, className } = props

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Basic Stats' />
      <span>
        TVL: {tvl.toLocaleString('en', { maximumFractionDigits: 0 })} {token.symbol}
      </span>
      <span>DPR: {formatPrettyPercentage(dpr)}</span>
      <span>Projected APR: {formatPrettyPercentage(dpr * 365)}</span>
    </div>
  )
}

const PrizesOverTime = (props: { numPrizes: number; prizeAmount: number; className?: string }) => {
  const { numPrizes, prizeAmount, className } = props

  const formattedDailyNumPrizes = getTimeBasedDrawValue(numPrizes, { noDecimals: true })
  const formattedDailyPrizeAmount = getTimeBasedDrawValue(prizeAmount, { noDecimals: true })

  const formattedWeeklyNumPrizes = getTimeBasedDrawValue(numPrizes * 7, { noDecimals: true })
  const formattedWeeklyPrizeAmount = getTimeBasedDrawValue(prizeAmount * 7, { noDecimals: true })

  const formattedMonthlyNumPrizes = getTimeBasedDrawValue((numPrizes * 365) / 12, {
    noDecimals: true
  })
  const formattedMonthlyPrizeAmount = getTimeBasedDrawValue((prizeAmount * 365) / 12, {
    noDecimals: true
  })

  const formattedYearlyNumPrizes = getTimeBasedDrawValue(numPrizes * 365, { noDecimals: true })
  const formattedYearlyPrizeAmount = getTimeBasedDrawValue(prizeAmount * 365, { noDecimals: true })

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Prizes Over Time' />
      <ul>
        <li className='grid grid-cols-3 gap-x-4 opacity-80'>
          <div>Timespan</div>
          <div>Prizes</div>
          <div>Amount</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>Daily</div>
          <div>{formattedDailyNumPrizes}</div>
          <div>{formattedDailyPrizeAmount}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>Weekly</div>
          <div>{formattedWeeklyNumPrizes}</div>
          <div>{formattedWeeklyPrizeAmount}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>Monthly</div>
          <div>{formattedMonthlyNumPrizes}</div>
          <div>{formattedMonthlyPrizeAmount}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>Yearly</div>
          <div>{formattedYearlyNumPrizes}</div>
          <div>{formattedYearlyPrizeAmount}</div>
        </li>
      </ul>
    </div>
  )
}

const DrawBreakdown = (props: { prizes: number[]; prizeChances: number[]; className?: string }) => {
  const { prizes, prizeChances, className } = props
  const [isCollapsed] = useAtom(isListCollapsed)

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Draw Breakdown' />
      {isCollapsed ? (
        <ul>
          <li className='grid grid-cols-5 gap-x-4 opacity-80'>
            <div>Prize</div>
            <div className='col-span-4'>Estimated Award Time</div>
          </li>
          {prizes.map((prize, i) => {
            if (prize === 0) return null

            return (
              <li key={`pl-time-${i}-${prizeChances[i]}`} className='grid grid-cols-5 gap-x-4'>
                <div>{prize.toLocaleString('en', { maximumFractionDigits: 2 })}</div>
                <div className='col-span-4'>
                  {calculateEstimatedTimeFromPrizeChance(prizeChances[i])}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className='mb-3'>
          <li className='grid grid-cols-5 gap-x-4 opacity-80'>
            <div>Prize</div>
            <div>Daily</div>
            <div>Weekly</div>
            <div>Monthly</div>
            <div>Yearly</div>
          </li>
          {prizes.map((prize, i) => {
            if (prize === 0) return null

            return (
              <li key={`pl-${i}-${prizeChances[i]}`} className='grid grid-cols-5 gap-x-4'>
                <div>{prize.toLocaleString('en', { maximumFractionDigits: 2 })}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i])}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i] * 7)}</div>
                <div>{getTimeBasedDrawValue((prizeChances[i] * 365) / 12)}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i] * 365)}</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const AdvancedOptions = (props: {
  tvl: number
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  setValue: UseFormSetValue<ProjectionSettings>
}) => {
  const { tvl, errors, register, setValue } = props
  const [isCollapsed] = useAtom(isListCollapsed)
  const { t } = useTranslation()

  return (
    <div className={classNames({ hidden: isCollapsed })}>
      <SectionTitle text='Advanced Options' />
      <ProjectionInput
        title='TVL'
        formKey='tvl'
        validate={{
          isValidNumber: (v) => !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: 'TVL' }),
          isGreaterThanOrEqualToZero: (v) =>
            parseFloat(v) >= 0 || t('fieldIsInvalid', { field: 'TVL' })
        }}
        errors={errors}
        register={register}
        onReset={() =>
          setValue('tvl', tvl.toFixed(0), {
            shouldValidate: true
          })
        }
      />
      <ProjectionInput
        title='Variance'
        formKey='variance'
        validate={{
          isValidNumber: (v) =>
            !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: 'Variance' }),
          isValidPercentage: (v) =>
            parseFloat(v) >= -100 || t('fieldIsInvalid', { field: 'Variance' })
        }}
        errors={errors}
        register={register}
        onReset={() => setValue('variance', '0', { shouldValidate: true })}
        percent
      />
    </div>
  )
}

const SectionTitle = (props: { text: string; className?: string }) => {
  return <h3 className={classNames('text-xs opacity-80', props.className)}>{props.text}</h3>
}

// TODO: these inputs should look a little prettier
const ProjectionInput = (props: {
  title: string
  formKey: keyof ProjectionSettings
  validate?: Record<string, (v: any) => true | string>
  disabled?: boolean
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  onReset?: Function
  className?: string
  percent?: boolean
}) => {
  const { title, formKey, validate, disabled, errors, register, onReset, className, percent } =
    props
  const { t } = useTranslation()

  return (
    <div className={classNames('mb-2', className)}>
      <Label className='uppercase' htmlFor={formKey}>
        {title}
        {percent && ' (%)'}
      </Label>
      <StyledInput
        id={formKey}
        invalid={!!errors[formKey]}
        className='w-full'
        {...register(formKey, {
          required: {
            value: true,
            message: t('blankIsRequired', { blank: title })
          },
          validate: validate
        })}
        disabled={disabled}
      />
      {!!onReset && (
        <div className='flex justify-end'>
          <button className='text-xxs opacity-80' onClick={() => onReset()}>
            Reset {title}
          </button>
        </div>
      )}
    </div>
  )
}
