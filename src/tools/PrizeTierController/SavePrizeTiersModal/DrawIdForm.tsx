import { ErrorMessage } from '@components/ErrorMessage'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { useTranslation } from 'next-i18next'
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
  const { t } = useTranslation()

  return (
    <div>
      <Label className='uppercase' htmlFor='drawId'>
        {t('drawIdLabel')}
      </Label>
      <p className='text-xxxs opacity-80 mb-2'>{t('newPrizeTierExplanation')}</p>
      <StyledInput
        id='drawId'
        invalid={!!errors.drawId}
        className='w-full'
        {...register('drawId', {
          required: {
            value: true,
            message: t('blankIsRequired', { blank: t('drawIdLabel') })
          },
          validate: {
            isValidInteger: (v) =>
              Number.isInteger(Number(v)) || t('fieldIsInvalid', { field: t('drawIdLabel') }),
            isGreaterThanZero: (v) =>
              parseInt(v) > 0 || t('fieldIsInvalid', { field: t('drawIdLabel') }),
            isGreaterThanNewestId: (v) =>
              parseInt(v) > minDrawId || t('fieldIsInvalid', { field: t('drawIdLabel') })
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
