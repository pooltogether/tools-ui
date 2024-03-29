import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Token } from '@pooltogether/hooks'
import { formatNumberForDisplay } from '@pooltogether/utilities'
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
import { formatPrettyDprPercentage } from '@prizeTierController/utils/formatPrettyPercentage'
import { getTimeBasedDrawValue } from '@prizeTierController/utils/formatTimeBasedDrawValue'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'
import {
  FieldErrorsImpl,
  useForm,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form'

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
          <AdvancedOptions
            prizePoolId={prizePool.id()}
            tvl={tvl}
            errors={errors}
            register={register}
            watch={watch}
            setValue={setValue}
          />
        </>
      ) : (
        t('loading')
      )}
    </>
  )
}

const BasicStats = (props: { tvl: number; dpr: number; token: Token; className?: string }) => {
  const { tvl, dpr, token, className } = props
  const { t } = useTranslation()

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text={t('basicStats')} />
      <span>
        TVL: {formatNumberForDisplay(tvl, { round: true, hideZeroes: true })} {token.symbol}
      </span>
      <span>DPR: {formatPrettyDprPercentage(dpr)}</span>
      <span>
        {t('projectedApr')}: {formatPrettyDprPercentage(dpr * 365)}
      </span>
    </div>
  )
}

const PrizesOverTime = (props: { numPrizes: number; prizeAmount: number; className?: string }) => {
  const { numPrizes, prizeAmount, className } = props
  const { t } = useTranslation()

  const formattedDailyNumPrizes = getTimeBasedDrawValue(numPrizes, 'day', { noDecimals: true })
  const formattedDailyPrizeAmount = getTimeBasedDrawValue(prizeAmount, 'day', { noDecimals: true })

  const formattedWeeklyNumPrizes = getTimeBasedDrawValue(numPrizes, 'week', { noDecimals: true })
  const formattedWeeklyPrizeAmount = getTimeBasedDrawValue(prizeAmount, 'week', {
    noDecimals: true
  })

  const formattedMonthlyNumPrizes = getTimeBasedDrawValue(numPrizes, 'month', {
    noDecimals: true
  })
  const formattedMonthlyPrizeAmount = getTimeBasedDrawValue(prizeAmount, 'month', {
    noDecimals: true
  })

  const formattedYearlyNumPrizes = getTimeBasedDrawValue(numPrizes, 'year', { noDecimals: true })
  const formattedYearlyPrizeAmount = getTimeBasedDrawValue(prizeAmount, 'year', {
    noDecimals: true
  })

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text={t('prizesOverTime')} />
      <ul>
        <li className='grid grid-cols-3 gap-x-4 opacity-80'>
          <div>{t('timespan')}</div>
          <div>{t('prizes')}</div>
          <div>{t('amount')}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>{t('daily')}</div>
          <div>{formattedDailyNumPrizes}</div>
          <div>{formattedDailyPrizeAmount}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>{t('weekly')}</div>
          <div>{formattedWeeklyNumPrizes}</div>
          <div>{formattedWeeklyPrizeAmount}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>{t('monthly')}</div>
          <div>{formattedMonthlyNumPrizes}</div>
          <div>{formattedMonthlyPrizeAmount}</div>
        </li>
        <li className='grid grid-cols-3 gap-x-4'>
          <div>{t('yearly')}</div>
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
  const { t } = useTranslation()

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text={t('drawBreakdown')} />
      {isCollapsed ? (
        <ul>
          <li className='grid grid-cols-5 gap-x-4 opacity-80'>
            <div>{t('prize')}</div>
            <div className='col-span-4'>{t('estimatedAwardTime')}</div>
          </li>
          {prizes.map((prize, i) => {
            if (prize === 0) return null

            return (
              <li key={`pl-time-${i}-${prizeChances[i]}`} className='grid grid-cols-5 gap-x-4'>
                <div>{formatNumberForDisplay(prize, { maximumFractionDigits: 2 })}</div>
                <div className='col-span-4'>
                  {calculateEstimatedTimeFromPrizeChance(prizeChances[i], t)}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className='mb-3'>
          <li className='grid grid-cols-5 gap-x-4 opacity-80'>
            <div>{t('prize')}</div>
            <div>{t('daily')}</div>
            <div>{t('weekly')}</div>
            <div>{t('monthly')}</div>
            <div>{t('yearly')}</div>
          </li>
          {prizes.map((prize, i) => {
            if (prize === 0) return null

            return (
              <li key={`pl-${i}-${prizeChances[i]}`} className='grid grid-cols-5 gap-x-4'>
                <div>{formatNumberForDisplay(prize, { maximumFractionDigits: 2 })}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i], 'day')}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i], 'week')}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i], 'month')}</div>
                <div>{getTimeBasedDrawValue(prizeChances[i], 'year')}</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const AdvancedOptions = (props: {
  prizePoolId: string
  tvl: number
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  watch: UseFormWatch<ProjectionSettings>
  setValue: UseFormSetValue<ProjectionSettings>
}) => {
  const { prizePoolId, tvl, errors, register, watch, setValue } = props
  const [isCollapsed] = useAtom(isListCollapsed)
  const { t } = useTranslation()

  return (
    <div className={classNames({ hidden: isCollapsed })}>
      <SectionTitle text={t('advancedOptions')} className='mb-2' />
      <ProjectionInput
        title='TVL'
        formKey='tvl'
        prizePoolId={prizePoolId}
        validate={{
          isValidNumber: (v) => !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: 'TVL' }),
          isGreaterThanOrEqualToZero: (v) =>
            parseFloat(v) >= 0 || t('fieldIsInvalid', { field: 'TVL' })
        }}
        errors={errors}
        register={register}
        watch={watch}
        setValue={setValue}
        onResetValue={tvl.toFixed(0)}
      />
      <ProjectionInput
        title={t('variance')}
        formKey='variance'
        prizePoolId={prizePoolId}
        validate={{
          isValidNumber: (v) =>
            !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: t('variance') }),
          isValidPercentage: (v) =>
            parseFloat(v) >= -100 || t('fieldIsInvalid', { field: t('variance') })
        }}
        errors={errors}
        register={register}
        watch={watch}
        setValue={setValue}
        onResetValue='0'
        percent
      />
    </div>
  )
}

const SectionTitle = (props: { text: string; className?: string }) => {
  return <h3 className={classNames('text-xs opacity-80', props.className)}>{props.text}</h3>
}

const ProjectionInput = (props: {
  title: string
  formKey: keyof ProjectionSettings
  prizePoolId: string
  validate?: Record<string, (v: any) => true | string>
  disabled?: boolean
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  watch: UseFormWatch<ProjectionSettings>
  setValue: UseFormSetValue<ProjectionSettings>
  onResetValue?: string
  className?: string
  percent?: boolean
}) => {
  const {
    title,
    formKey,
    prizePoolId,
    validate,
    disabled,
    errors,
    register,
    watch,
    setValue,
    onResetValue,
    className,
    percent
  } = props
  const { t } = useTranslation()

  const inputId = `${prizePoolId}-${formKey}`

  const formValue = watch(formKey)

  return (
    <div className={classNames(className)}>
      <Label className='uppercase' htmlFor={inputId}>
        {title}
        {percent && ' (%)'}
      </Label>
      <StyledInput
        id={inputId}
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
      {!!onResetValue && (
        <div className='flex justify-end mt-1'>
          <button
            className={classNames('text-xxs opacity-20', {
              'opacity-80': formValue !== onResetValue
            })}
            onClick={() => setValue(formKey, onResetValue, { shouldValidate: true })}
          >
            {t('reset')} {title}
          </button>
        </div>
      )}
    </div>
  )
}
