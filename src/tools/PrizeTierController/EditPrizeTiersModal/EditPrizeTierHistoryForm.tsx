import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { calculate, calculateNumberOfPrizesForTierIndex } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { getLastNonZeroTier } from '@prizeTierController/utils/getLastNonZeroTier'
import classNames from 'classnames'
import { utils } from 'ethers'
import { useState } from 'react'
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
}) => {
  const { onSubmit, defaultValues, decimals } = props
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
  if (!!bitRange && tierValues.length > 0 && tierValues.every((value) => !Number.isNaN(value))) {
    const totalValueOfPrizes = tierValues.reduce(
      (a, b, i) => a + b * calculateNumberOfPrizesForTierIndex(bitRange, i),
      0
    )
    setValue('prize', totalValueOfPrizes.toString())
  }

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className='flex flex-col' autoComplete='off'>
      <div className='flex flex-col'>
        <BitRangeSize errors={errors} register={register} />
        <ExpiryDuration errors={errors} register={register} />
        <MaxPicksPerUser errors={errors} register={register} />
        <PrizeValue errors={errors} register={register} />
      </div>
      <PrizeTiers
        errors={errors}
        register={register}
        control={control}
        watch={watch}
        decimals={decimals}
      />
      <Button type='submit' disabled={!isValid}>
        Save
      </Button>
    </form>
  )
}

const BitRangeSize = (props: {
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
}) => {
  const { errors, register } = props

  return (
    <div>
      <Label className='uppercase' htmlFor='bitRangeSize'>
        Bit Range Size
      </Label>
      <StyledInput
        id='bitRangeSize'
        invalid={!!errors.bitRangeSize}
        className='w-full'
        {...register('bitRangeSize', {
          required: {
            value: true,
            message: 'Bit Range Size is required'
          },
          validate: {
            isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Bit Range Size',
            isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Bit Range Size'
          }
        })}
      />
      <ErrorMessage>
        {!!errors.bitRangeSize?.message && typeof errors.bitRangeSize.message === 'string'
          ? errors.bitRangeSize.message
          : null}
      </ErrorMessage>
    </div>
  )
}

const ExpiryDuration = (props: {
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
}) => {
  const { errors, register } = props

  return (
    <div>
      <Label className='uppercase' htmlFor='expiryDuration'>
        Expiry Duration
      </Label>
      <StyledInput
        id='expiryDuration'
        invalid={!!errors.expiryDuration}
        className='w-full'
        {...register('expiryDuration', {
          required: {
            value: true,
            message: 'Expiry Duration is required'
          },
          validate: {
            isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Expiry Duration',
            isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Expiry Duration'
          }
        })}
      />
      <ErrorMessage>
        {!!errors.expiryDuration?.message && typeof errors.expiryDuration.message === 'string'
          ? errors.expiryDuration.message
          : null}
      </ErrorMessage>
    </div>
  )
}
const MaxPicksPerUser = (props: {
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
}) => {
  const { errors, register } = props

  return (
    <div>
      <Label className='uppercase' htmlFor='maxPicksPerUser'>
        Max Picks Per User
      </Label>
      <StyledInput
        id='maxPicksPerUser'
        invalid={!!errors.maxPicksPerUser}
        className='w-full'
        {...register('maxPicksPerUser', {
          required: {
            value: true,
            message: 'Max Picks Per User is required'
          },
          validate: {
            isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Max Picks Per User',
            isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Max Picks Per User'
          }
        })}
      />
      <ErrorMessage>
        {!!errors.maxPicksPerUser?.message && typeof errors.maxPicksPerUser.message === 'string'
          ? errors.maxPicksPerUser.message
          : null}
      </ErrorMessage>
    </div>
  )
}
const PrizeValue = (props: {
  errors: FieldErrorsImpl<EditPrizeTierFormValues>
  register: UseFormRegister<EditPrizeTierFormValues>
}) => {
  const { errors, register } = props

  return (
    <div>
      <Label className='uppercase' htmlFor='prize'>
        Prize Value
      </Label>
      <StyledInput
        id='prize'
        invalid={!!errors.prize}
        className='w-full'
        {...register('prize', {
          required: {
            value: true,
            message: 'Prize Value is required'
          },
          validate: {
            isValidNumber: (v) => !Number.isNaN(Number(v)) || 'Invalid Prize Value',
            isGreaterThanZero: (v) => utils.parseEther(v).gt(0) || 'Invalid Prize Value'
          }
        })}
        disabled
      />
      <ErrorMessage>
        {!!errors.prize?.message && typeof errors.prize.message === 'string'
          ? errors.prize.message
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
  const tierValues = watch('tiers').map((item) => Number(item.value))
  const lastNonZeroTier = getLastNonZeroTier(tierValues)
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
                  'opacity-60': !errors.tiers?.[index] && tierValues[index] == 0
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
