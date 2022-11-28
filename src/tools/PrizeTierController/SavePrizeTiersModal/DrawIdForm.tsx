import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { useEffect } from 'react'
import { FieldErrorsImpl, useForm, UseFormRegister } from 'react-hook-form'

export const DrawIdForm = (props: {
  onChange: (drawId: number) => void
  defaultValues: { drawId: string }
  minDrawId: number
}) => {
  const { onChange, defaultValues, minDrawId } = props
  const {
    register,
    watch,
    formState: { errors, isValid }
  } = useForm<{ drawId: string }>({
    mode: 'onChange',
    defaultValues,
    shouldUnregister: true
  })

  const drawId = watch('drawId')

  useEffect(() => {
    const numDrawId = Number(drawId)
    if (Number.isInteger(numDrawId) && numDrawId > minDrawId) {
      onChange(numDrawId)
    }
  }, [drawId])

  return (
    <form className='flex flex-col' autoComplete='off'>
      <DrawIdInput minDrawId={minDrawId} errors={errors} register={register} />
    </form>
  )
}

const DrawIdInput = (props: {
  minDrawId: number
  errors: FieldErrorsImpl<{ drawId: string }>
  register: UseFormRegister<{ drawId: string }>
}) => {
  const { minDrawId, errors, register } = props

  return (
    <div>
      <Label className='uppercase' htmlFor='drawId'>
        Draw ID
      </Label>
      <p className='text-xxxs opacity-80 mb-2'>New prize tier begins on the following draw:</p>
      <StyledInput
        id='drawId'
        invalid={!!errors.drawId}
        className='w-full'
        {...register('drawId', {
          required: {
            value: true,
            message: 'Draw ID is required'
          },
          validate: {
            isValidInteger: (v) => Number.isInteger(Number(v)) || 'Invalid Draw ID',
            isGreaterThanZero: (v) => parseInt(v) > 0 || 'Invalid Draw ID',
            isGreaterThanNewestId: (v) => parseInt(v) > minDrawId || 'Invalid Draw ID (Too Early)'
          }
        })}
      />
      <ErrorMessage>
        {!!errors.drawId?.message && typeof errors.drawId.message === 'string'
          ? errors.drawId.message
          : null}
      </ErrorMessage>
    </div>
  )
}
