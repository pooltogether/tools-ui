import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { calculate, calculateNumberOfPrizesForTierIndex } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { getLastNonZeroTierIndex } from '@prizeTierController/utils/getLastNonZeroTierIndex'
import classNames from 'classnames'
import { utils } from 'ethers'
import { useEffect, useState } from 'react'
import {
  FieldErrorsImpl,
  useForm,
  UseFormRegister,
  UseFormWatch,
  useFieldArray,
  Control
} from 'react-hook-form'
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback'

export const EditPrizeTierHistoryForm = (props: {
  onSubmit: (prizeTier: EditPrizeTierFormValues) => void
  defaultValues?: Partial<EditPrizeTierFormValues>
  decimals: number
  displayAdvancedOptions?: boolean
}) => {
  const { onSubmit, defaultValues, decimals, displayAdvancedOptions } = props
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

  // Reactively calculating prize value based on bitrange and tier changes:
  const bitRange = parseInt(watch('bitRangeSize'))
  const tierValues = watch('tiers').map((item) => Number(item.value))
  const updatePrizeValue = useDebouncedCallback((bitRange: number, tierValues: number[]) => {
    if (!!bitRange && tierValues.length > 0 && tierValues.every((value) => !Number.isNaN(value))) {
      const totalValueOfPrizes = tierValues.reduce(
        (a, b, i) => a + b * calculateNumberOfPrizesForTierIndex(bitRange, i),
        0
      )
      setValue('prize', totalValueOfPrizes.toString())
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
          title='Prize Value'
          formKey='prize'
          validate={{
            isValidNumber: (v) => !Number.isNaN(Number(v)) || 'Invalid Prize Value',
            isGreaterThanZero: (v) => utils.parseEther(v).gt(0) || 'Invalid Prize Value'
          }}
          errors={errors}
          register={register}
          disabled
        />
      </div>
      <PrizeTiers
        errors={errors}
        register={register}
        control={control}
        watch={watch}
        decimals={decimals}
      />
      <Button type='submit' disabled={!isValid}>
        Queue Edits
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
  return (
    <div
      className={classNames(className, 'flex flex-col p-4 pb-0 bg-pt-purple-bright rounded-xl', {
        hidden: isHidden
      })}
    >
      <FormElement
        title='Bit Range Size'
        formKey='bitRangeSize'
        validate={{
          isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Bit Range Size',
          isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Bit Range Size'
        }}
        errors={errors}
        register={register}
      />
      <FormElement
        title='Expiry Duration'
        formKey='expiryDuration'
        validate={{
          isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Expiry Duration',
          isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Expiry Duration'
        }}
        errors={errors}
        register={register}
      />
      <FormElement
        title='Max Picks Per User'
        formKey='maxPicksPerUser'
        validate={{
          isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Max Picks Per User',
          isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Max Picks Per User'
        }}
        errors={errors}
        register={register}
      />
      <FormElement
        title='End Timestamp Offset'
        formKey='endTimestampOffset'
        validate={{
          isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid End Timestamp Offset',
          isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid End Timestamp Offset'
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
            message: `${title} is required`
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

  return (
    <div>
      {fields.map((item, index) => {
        if (index <= lastIndexDisplayed) {
          const numPrizesInTier = calculate.calculateNumberOfPrizesForTierIndex(bitRange, index)
          return (
            <div key={`prize-tier-${item.id}`}>
              <Label className='uppercase flex gap-2 justify-between' htmlFor={item.id}>
                <span>Tier {index + 1}</span>
                <span>
                  ({numPrizesInTier.toLocaleString()} Prize{numPrizesInTier > 1 ? 's' : ''})
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
                    isValidNumber: (v) => !Number.isNaN(Number(v)) || 'Invalid Prize Tier',
                    isGreaterThanOrEqualToZero: (v) => parseFloat(v) >= 0 || 'Invalid Prize Tier',
                    isNotTooSpecific: (v) =>
                      v.split('.').length < 2 ||
                      v.split('.')[1].length < decimals ||
                      'Invalid Prize Tier (Too Many Decimals)'
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
            Add Tier
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
            Remove Tier
          </Button>
        )}
      </div>
    </div>
  )
}
