import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { calculate } from '@pooltogether/v4-utils-js'
import {
  allCombinedPrizeTiersAtom,
  allProjectionSettingsAtom,
  isListCollapsed
} from '@prizeTierController/atoms'
import { DRAWS_PER_DAY } from '@prizeTierController/config'
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
  const [allProjectionSettings] = useAtom(allProjectionSettingsAtom)
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

  const projectionSettings = allProjectionSettings[prizePool.chainId]?.[prizePool.id()]

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      <PrizeTierHistoryTitle prizeTierHistoryContract={prizeTierHistoryContract} className='mb-4' />
      {!!prizeTier ? (
        <PrizePoolProjections
          prizePool={prizePool}
          prizeTierHistoryContract={prizeTierHistoryContract}
          prizeTier={prizeTier}
          projectionSettings={projectionSettings}
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
  projectionSettings: ProjectionSettings
}) => {
  const { prizePool, prizeTierHistoryContract, prizeTier, projectionSettings } = props
  const { data: tvl, isFetched: isFetchedTvl } = usePrizePoolTvl(prizePool)
  const [allProjectionSettings, setAllProjectionSettings] = useAtom(allProjectionSettingsAtom)
  const {
    register,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ProjectionSettings>({
    mode: 'onChange',
    defaultValues: projectionSettings ?? { tvl: '0', variance: '0', dropped: '0' },
    shouldUnregister: true
  })
  const { t } = useTranslation()

  const formTvl = watch('tvl')
  const parsedFormTvl = parseFloat(formTvl?.replaceAll(',', ''))
  const formDroppedPrizes = watch('dropped')
  const formVariance = watch('variance')

  // Function to update `allProjectionSettings`:
  const updateProjectionSettings = (key: keyof ProjectionSettings, value: string) => {
    setAllProjectionSettings(() => {
      const updatedProjectionSettings = { ...allProjectionSettings }
      if (!updatedProjectionSettings[prizePool.chainId]) {
        updatedProjectionSettings[prizePool.chainId] = {}
      }
      updatedProjectionSettings[prizePool.chainId][prizePool.id()] = {
        tvl:
          key === 'tvl'
            ? value
            : updatedProjectionSettings[prizePool.chainId][prizePool.id()]?.tvl ??
              tvl.toLocaleString('en', { maximumFractionDigits: 0 }),
        dropped:
          key === 'dropped'
            ? value
            : updatedProjectionSettings[prizePool.chainId][prizePool.id()]?.dropped ?? '0',
        variance:
          key === 'variance'
            ? value
            : updatedProjectionSettings[prizePool.chainId][prizePool.id()]?.variance ?? '0'
      }
      return updatedProjectionSettings
    })
  }

  useEffect(() => {
    if (isFetchedTvl) {
      if (formTvl === '0' || formTvl === undefined) {
        setValue('tvl', tvl.toLocaleString('en', { maximumFractionDigits: 0 }))
        if (allProjectionSettings[prizePool.chainId]?.[prizePool.id()] === undefined) {
          updateProjectionSettings('tvl', tvl.toLocaleString('en', { maximumFractionDigits: 0 }))
        }
      } else if (!!parsedFormTvl) {
        updateProjectionSettings('tvl', formTvl)
      }
    }
  }, [tvl, isFetchedTvl, formTvl, parsedFormTvl])

  useEffect(() => {
    if (isFetchedTvl) {
      if (
        formDroppedPrizes !== undefined &&
        !Number.isNaN(Number(formDroppedPrizes.replaceAll(',', '')))
      ) {
        updateProjectionSettings('dropped', formDroppedPrizes)
      }
    }
  }, [isFetchedTvl, formDroppedPrizes])

  useEffect(() => {
    if (isFetchedTvl) {
      if (formVariance !== undefined && !Number.isNaN(Number(formVariance.replaceAll(',', '')))) {
        updateProjectionSettings('variance', formVariance)
      }
    }
  }, [isFetchedTvl, formVariance])

  const dprMultiplier = !!parsedFormTvl
    ? calculateDprMultiplier(
        prizeTier.dpr,
        parsedFormTvl,
        prizeTier.prize,
        prizeTierHistoryContract.token.decimals
      )
    : 0

  const prizes = prizeTier.tiers.map((tier, i) =>
    parseFloat(
      formatUnits(
        calculate.calculatePrizeForTierPercentage(i, tier, prizeTier.bitRangeSize, prizeTier.prize),
        parseInt(prizeTierHistoryContract.token.decimals)
      )
    )
  )

  const numPrizesPerTier = calculate.calculateNumberOfPrizesPerTier(prizeTier)
  const prizeChances = numPrizesPerTier.map((value) => value * dprMultiplier)
  const expectedNumPrizes = prizeChances.reduce((a, b) => a + b, 0)
  const expectedTierPrizeAmounts = prizes.map((prize, i) => prize * prizeChances[i])
  const expectedPrizeAmount = expectedTierPrizeAmounts.reduce((a, b) => a + b, 0)

  return (
    <>
      {isFetchedTvl ? (
        <>
          <BasicStats
            tvl={tvl}
            formTvl={formTvl}
            dpr={prizeTier.dpr}
            token={prizeTierHistoryContract.token}
            errors={errors}
            register={register}
            setValue={setValue}
            className='mb-2'
          />
          <PrizesOverTime
            numPrizes={expectedNumPrizes}
            prizeAmount={expectedPrizeAmount}
            className='mb-2'
          />
          <DrawBreakdown prizes={prizes} prizeChances={prizeChances} className='mb-2' />
          <DroppedPrizesInput errors={errors} register={register} setValue={setValue} />
          <VarianceInput errors={errors} register={register} setValue={setValue} />
        </>
      ) : (
        t('loading')
      )}
    </>
  )
}

const BasicStats = (props: {
  tvl: number
  formTvl: string
  dpr: number
  token: Token
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  setValue: UseFormSetValue<ProjectionSettings>
  className?: string
}) => {
  const { tvl, formTvl, dpr, token, errors, register, setValue, className } = props
  const [isCollapsed] = useAtom(isListCollapsed)
  const { t } = useTranslation()

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Basic Stats' />
      {isCollapsed && (
        <span>
          TVL: {formTvl} {token.symbol}
        </span>
      )}
      <ProjectionInput
        title='TVL'
        formKey='tvl'
        validate={{
          isValidNumber: (v) =>
            !Number.isNaN(Number(v.replaceAll(',', ''))) || t('fieldIsInvalid', { field: 'TVL' }),
          isGreaterThanOrEqualToZero: (v) =>
            parseFloat(v.replaceAll(',', '')) >= 0 || t('fieldIsInvalid', { field: 'TVL' })
        }}
        errors={errors}
        register={register}
        onReset={() =>
          setValue('tvl', tvl.toLocaleString('en', { maximumFractionDigits: 0 }), {
            shouldValidate: true
          })
        }
        className={classNames({ hidden: isCollapsed })}
      />
      <span>DPR: {formatPrettyPercentage(dpr)}</span>
      <span>Projected APR: {formatPrettyPercentage(dpr * 365)}</span>
    </div>
  )
}

const PrizesOverTime = (props: { numPrizes: number; prizeAmount: number; className?: string }) => {
  const { numPrizes, prizeAmount, className } = props

  const formattedDailyNumPrizes = (numPrizes * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })
  const formattedDailyPrizeAmount = (prizeAmount * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })

  const formattedWeeklyNumPrizes = (numPrizes * 7 * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })
  const formattedWeeklyPrizeAmount = (prizeAmount * 7 * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })

  const formattedMonthlyNumPrizes = (((numPrizes * 365) / 12) * DRAWS_PER_DAY).toLocaleString(
    'en',
    {
      maximumFractionDigits: 0
    }
  )
  const formattedMonthlyPrizeAmount = (((prizeAmount * 365) / 12) * DRAWS_PER_DAY).toLocaleString(
    'en',
    {
      maximumFractionDigits: 0
    }
  )

  const formattedYearlyNumPrizes = (numPrizes * 365 * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })
  const formattedYearlyPrizeAmount = (prizeAmount * 365 * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })

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
                <div>
                  {(prizeChances[i] * DRAWS_PER_DAY).toLocaleString('en', {
                    maximumFractionDigits: 3
                  })}
                </div>
                <div>
                  {(prizeChances[i] * 7 * DRAWS_PER_DAY).toLocaleString('en', {
                    maximumFractionDigits: 3
                  })}
                </div>
                <div>
                  {(((prizeChances[i] * 365) / 12) * DRAWS_PER_DAY).toLocaleString('en', {
                    maximumFractionDigits: 2
                  })}
                </div>
                <div>
                  {(prizeChances[i] * 365 * DRAWS_PER_DAY).toLocaleString('en', {
                    maximumFractionDigits: 2
                  })}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// TODO: use dropped prizes input in relevant calculations
const DroppedPrizesInput = (props: {
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  setValue: UseFormSetValue<ProjectionSettings>
}) => {
  const { errors, register, setValue } = props
  const [isCollapsed] = useAtom(isListCollapsed)
  const { t } = useTranslation()

  return (
    <ProjectionInput
      title='Dropped Prizes'
      formKey='dropped'
      validate={{
        isValidNumber: (v) =>
          !Number.isNaN(Number(v.replaceAll(',', ''))) ||
          t('fieldIsInvalid', { field: 'Dropped Prizes %' })
      }}
      errors={errors}
      register={register}
      onReset={() => setValue('dropped', '0', { shouldValidate: true })}
      className={classNames({ hidden: isCollapsed })}
      percent
    />
  )
}

// TODO: use variance input in relevant calculations
const VarianceInput = (props: {
  errors: FieldErrorsImpl<ProjectionSettings>
  register: UseFormRegister<ProjectionSettings>
  setValue: UseFormSetValue<ProjectionSettings>
}) => {
  const { errors, register, setValue } = props
  const [isCollapsed] = useAtom(isListCollapsed)
  const { t } = useTranslation()

  return (
    <ProjectionInput
      title='Variance'
      formKey='variance'
      validate={{
        isValidNumber: (v) =>
          !Number.isNaN(Number(v.replaceAll(',', ''))) || t('fieldIsInvalid', { field: 'Variance' })
      }}
      errors={errors}
      register={register}
      onReset={() => setValue('variance', '0', { shouldValidate: true })}
      className={classNames({ hidden: isCollapsed })}
      percent
    />
  )
}

const SectionTitle = (props: { text: string; className?: string }) => {
  return <h3 className={classNames('text-xs opacity-80', props.className)}>{props.text}</h3>
}

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
