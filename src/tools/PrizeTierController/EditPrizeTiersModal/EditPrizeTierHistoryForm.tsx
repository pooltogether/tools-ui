import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { calculate } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { formatTotalPrizeValue } from '@prizeTierController/utils/formatTotalPrizeValue'
import { getLastNonZeroTierIndex } from '@prizeTierController/utils/getLastNonZeroTierIndex'
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback'
import classNames from 'classnames'
import { utils } from 'ethers'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import {
  FieldErrorsImpl,
  useForm,
  UseFormRegister,
  UseFormWatch,
  useFieldArray,
  Control
} from 'react-hook-form'

export const EditPrizeTierHistoryForm = (props: {
  onSubmit: (prizeTier: EditPrizeTierFormValues) => void
  defaultValues?: Partial<EditPrizeTierFormValues>
  decimals: number
  displayAdvancedOptions?: boolean
  isV2?: boolean
}) => {
  const { onSubmit, defaultValues, decimals, displayAdvancedOptions, isV2 } = props
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<EditPrizeTierFormValues>({
    mode: 'onChange',
    defaultValues,
    shouldUnregister: true
  })
  const { t } = useTranslation()

  // Reactively calculating prize value based on bitrange and tier changes:
  const bitRange = parseInt(watch('bitRangeSize'))
  const tierValues = watch('tiers').map((item) => Number(item.value))
  const updatePrizeValue = useDebouncedCallback((bitRange: number, tierValues: number[]) => {
    if (!!bitRange && tierValues.length > 0 && tierValues.every((value) => !Number.isNaN(value))) {
      const totalValueOfPrizes = formatTotalPrizeValue(tierValues, bitRange, decimals)
      setValue('prize', totalValueOfPrizes.toString(), { shouldValidate: true })
    }
  })
  useEffect(() => {
    updatePrizeValue(bitRange, tierValues)
    return () => updatePrizeValue.cancel()
  }, [bitRange, tierValues])

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className='flex flex-col' autoComplete='off'>
      <div className='flex flex-col'>
        <AdvancedOptions
          errors={errors}
          register={register}
          className='mb-6'
          isHidden={!displayAdvancedOptions}
        />
        <FormElement
          title={t('prizeValue')}
          formKey='prize'
          validate={{
            isValidNumber: (v) =>
              !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: t('prizeValue') }),
            isGreaterThanZero: (v) =>
              utils.parseEther(v).gt(0) || t('fieldIsInvalid', { field: t('prizeValue') })
          }}
          errors={errors}
          register={register}
          disabled
        />
        {isV2 && (
          <FormElement
            title={`${t('drawPercentageRate')} (%)`}
            formKey='dpr'
            validate={{
              isValidNumber: (v) =>
                !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: t('drawPercentageRate') }),
              isGreaterThanZero: (v) =>
                parseInt(v) > 0 || t('fieldIsInvalid', { field: t('drawPercentageRate') }),
              isLessThanOrEqualToOneHundred: (v) =>
                parseInt(v) <= 100 || t('fieldIsInvalid', { field: t('drawPercentageRate') })
            }}
            errors={errors}
            register={register}
          />
        )}
      </div>
      <PrizeTiers
        errors={errors}
        register={register}
        control={control}
        watch={watch}
        decimals={decimals}
      />
      <Button type='submit' disabled={!isValid}>
        {t('queueUpdate')}
      </Button>
    </form>
  )
}

const AdvancedOptions = (props: {
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
  className?: string
  isHidden?: boolean
}) => {
  const { errors, register, className, isHidden } = props
  const { t } = useTranslation()

  return (
    <div
      className={classNames(className, 'flex flex-col p-4 pb-0 bg-pt-purple-bright rounded-xl', {
        hidden: isHidden
      })}
    >
      <FormElement
        title={t('bitRangeSize')}
        formKey='bitRangeSize'
        validate={{
          isValidInteger: (v) =>
            Number.isInteger(Number(v)) || t('fieldIsInvalid', { field: t('bitRangeSize') }),
          isGreaterThanZero: (v) =>
            parseInt(v) > 0 || t('fieldIsInvalid', { field: t('bitRangeSize') })
        }}
        errors={errors}
        register={register}
      />
      <FormElement
        title={t('expiryDuration')}
        formKey='expiryDuration'
        validate={{
          isValidInteger: (v) =>
            Number.isInteger(Number(v)) || t('fieldIsInvalid', { field: t('expiryDuration') }),
          isGreaterThanZero: (v) =>
            parseInt(v) > 0 || t('fieldIsInvalid', { field: t('expiryDuration') })
        }}
        errors={errors}
        register={register}
      />
      <FormElement
        title={t('maxPicksPerUser')}
        formKey='maxPicksPerUser'
        validate={{
          isValidInteger: (v) =>
            Number.isInteger(Number(v)) || t('fieldIsInvalid', { field: t('maxPicksPerUser') }),
          isGreaterThanZero: (v) =>
            parseInt(v) > 0 || t('fieldIsInvalid', { field: t('maxPicksPerUser') })
        }}
        errors={errors}
        register={register}
      />
      <FormElement
        title={t('endTimestampOffset')}
        formKey='endTimestampOffset'
        validate={{
          isValidInteger: (v) =>
            Number.isInteger(Number(v)) || t('fieldIsInvalid', { field: t('endTimestampOffset') }),
          isGreaterThanZero: (v) =>
            parseInt(v) > 0 || t('fieldIsInvalid', { field: t('endTimestampOffset') })
        }}
        errors={errors}
        register={register}
      />
    </div>
  )
}

const FormElement = (props: {
  title: string
  formKey: keyof EditPrizeTierFormValues
  validate?: Record<string, (v: any) => true | string>
  disabled?: boolean
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
}) => {
  const { title, formKey, validate, disabled, errors, register } = props
  const { t } = useTranslation()

  return (
    <div>
      <Label className='uppercase' htmlFor={formKey}>
        {title}
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
      <ErrorMessage>
        {!!errors[formKey]?.message && typeof errors[formKey].message === 'string'
          ? errors[formKey].message
          : null}
      </ErrorMessage>
    </div>
  )
}

const PrizeTiers = (props: {
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
  control: Control<EditPrizeTierFormValues, any>
  watch: UseFormWatch<EditPrizeTierFormValues>
  decimals: number
}) => {
  const { errors, register, control, watch, decimals } = props
  const { fields } = useFieldArray({ control, name: 'tiers' })
  const bitRange = parseInt(watch('bitRangeSize'))
  const tierValues = watch('tiers').map((item) => item.value)
  const lastNonZeroTier = getLastNonZeroTierIndex(tierValues)
  const [lastIndexDisplayed, setLastIndexDisplayed] = useState<number>(lastNonZeroTier)
  const { t } = useTranslation()

  return (
    <div>
      {fields.map((item, index) => {
        if (index <= lastIndexDisplayed) {
          const numPrizesInTier = calculate.calculateNumberOfPrizesForTierIndex(bitRange, index)
          return (
            <div key={`prize-tier-${item.id}`}>
              <Label className='uppercase flex gap-2 justify-between' htmlFor={item.id}>
                <span>
                  {t('tier')} {index + 1}
                </span>
                <span>
                  ({numPrizesInTier.toLocaleString()}{' '}
                  {numPrizesInTier > 1 ? t('prizes') : t('prize')})
                </span>
              </Label>
              <StyledInput
                id={item.id}
                invalid={!!errors.tiers?.[index]}
                className={classNames('w-full', {
                  'opacity-60': !errors.tiers?.[index] && Number(tierValues[index]) == 0
                })}
                {...register(`tiers.${index}.value`, {
                  validate: {
                    isValidNumber: (v) =>
                      !Number.isNaN(Number(v)) || t('fieldIsInvalid', { field: t('tier') }),
                    isGreaterThanOrEqualToZero: (v) =>
                      parseFloat(v) >= 0 || t('fieldIsInvalid', { field: t('tier') }),
                    isNotTooSpecific: (v) =>
                      v.split('.').length < 2 ||
                      v.split('.')[1].length < decimals ||
                      t('fieldIsInvalid', { field: t('tier') })
                  }
                })}
              />
              {/* TODO: (BUG) Tier error messages are not being displayed. */}
              <ErrorMessage>
                {!!errors.tiers?.[index]?.message && typeof errors.tiers[index].message === 'string'
                  ? errors.tiers?.[index]?.message
                  : null}
              </ErrorMessage>
            </div>
          )
        }
      })}
      <div className='flex gap-2 mb-6'>
        {lastIndexDisplayed < 15 && (
          <Button
            type='button'
            onClick={() => {
              setLastIndexDisplayed(lastIndexDisplayed + 1)
            }}
            size={ButtonSize.sm}
          >
            {t('addTier')}
          </Button>
        )}
        {lastIndexDisplayed > lastNonZeroTier && (
          <Button
            type='button'
            onClick={() => {
              setLastIndexDisplayed(lastIndexDisplayed - 1)
            }}
            size={ButtonSize.sm}
            theme={ButtonTheme.orange}
          >
            {`${t('removeTier')} ${lastIndexDisplayed + 1}`}
          </Button>
        )}
      </div>
    </div>
  )
}
