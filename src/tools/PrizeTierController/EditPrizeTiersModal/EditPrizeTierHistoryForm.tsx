import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { Button } from '@pooltogether/react-components'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import { FieldErrorsImpl, useForm, UseFormRegister, useFieldArray, Control } from 'react-hook-form'

export const EditPrizeTierHistoryForm = (props: {
  onSubmit: (prizeTier: EditPrizeTierFormValues) => void
  defaultValues?: Partial<EditPrizeTierFormValues>
}) => {
  const { onSubmit, defaultValues } = props
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors, isValid }
  } = useForm<EditPrizeTierFormValues>({
    mode: 'onChange',
    defaultValues,
    shouldUnregister: true
  })

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className='flex flex-col' autoComplete='off'>
      <div className='flex flex-col'>
        <BitRangeSize errors={errors} register={register} />
        <ExpiryDuration errors={errors} register={register} />
        <MaxPicksPerUser errors={errors} register={register} />
        <PrizeValue errors={errors} register={register} />
      </div>
      <PrizeTiers errors={errors} register={register} control={control} />
      <Button type='submit'>Save</Button>
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
          // required: {
          //   value: true,
          //   message: 'Bit Range Size is required'
          // },
          // validate: {
          //   isGreaterThanZero: (v) => v > 0 || 'Invalid Bit Range Size'
          // }
        })}
      />
      <ErrorMessage>
        {!!errors?.bitRangeSize?.message && typeof errors.bitRangeSize.message === 'string'
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
          // required: {
          //   value: true,
          //   message: 'Expiry Duration is required'
          // },
          // validate: {
          //   isGreaterThanZero: (v) => v > 0 || 'Invalid Expiry Duration'
          // }
        })}
      />
      <ErrorMessage>
        {!!errors?.expiryDuration?.message && typeof errors.expiryDuration.message === 'string'
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
          // required: {
          //   value: true,
          //   message: 'Max Picks Per User is required'
          // },
          // validate: {
          //   isGreaterThanZero: (v) => v > 0 || 'Invalid Max Picks Per User'
          // }
        })}
      />
      <ErrorMessage>
        {!!errors?.maxPicksPerUser?.message && typeof errors.maxPicksPerUser.message === 'string'
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
        onChange={(e) => {}}
        {...register('prize', {
          // required: {
          //   value: true,
          //   message: 'Prize Value is required'
          // },
          // validate: {
          //   isGreaterThanZero: (v) => BigNumber.from(v).gt(0) || 'Invalid Prize Value'
          // }
        })}
      />
      <ErrorMessage>
        {!!errors?.prize?.message && typeof errors.prize.message === 'string'
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
}) => {
  const { errors, register, control } = props
  const { fields, append, remove } = useFieldArray({ control, name: 'tiers' })
  return (
    <div>
      Prize Tiers
      {fields.map((item, index) => {
        return (
          <div>
            <Label className='uppercase' htmlFor={item.id}>
              Tier {index + 1}
            </Label>
            <StyledInput
              id={item.id}
              invalid={!!errors.tiers?.[index]}
              className='w-full'
              onChange={(e) => {}}
              {...register(`tiers.${index}.value`, {
                validate: {
                  isGreaterThanOrEqualToZero: (v) => v >= 0 || 'Invalid Prize Tier'
                }
              })}
            />
            <ErrorMessage>
              {!!errors?.tiers?.[index]?.message && typeof errors.tiers[index].message === 'string'
                ? errors.tiers?.[index]?.message
                : null}
            </ErrorMessage>
          </div>
        )
      })}
    </div>
  )
}
