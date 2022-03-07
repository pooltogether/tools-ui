import { Input } from '@components/Input'
import { Label } from '@components/Label'
import { SquareButton } from '@pooltogether/react-components'
import { DelegationFormValues } from '@twabDelegator/interfaces'
import { useForm } from 'react-hook-form'

interface DelegationFormProps {
  onSubmit: (data: DelegationFormValues) => void
  defaultValues: DelegationFormValues
  submitString: string
}

/**
 *
 * @param props
 * @returns
 */
export const DelegationForm: React.FC<DelegationFormProps> = (props) => {
  const { onSubmit, defaultValues, submitString } = props

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid, isValidating }
  } = useForm<DelegationFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col' autoComplete='off'>
      <Label className='uppercase' htmlFor='delegatee'>
        Delegatee
      </Label>
      <Input
        id='delegatee'
        className='mb-2 w-full'
        placeholder='0xabc...'
        // TODO: Validation
        // Entered value is a valid address
        {...register('delegatee', { required: true })}
      />
      <Label className='uppercase' htmlFor='balance'>
        Amount (PTaUSDC)
      </Label>
      <Input
        id='balance'
        className='mb-2 w-full'
        placeholder='10'
        // TODO: Validation
        // Max amount is users ticket balance + users stake
        // Min amount is 0
        {...register('balance', { required: true })}
      />
      <Label className='uppercase' htmlFor='duration'>
        Duration (days)
      </Label>
      <Input
        id='duration'
        className='w-1/3'
        placeholder='0'
        {...register('duration', {
          required: true,
          valueAsNumber: true,
          min: 0,
          // TODO: Fetch the MAX_LOCK value from the Twab Delegator
          max: 180
        })}
      />
      <SquareButton className='mt-10' disabled={!isValid} type='submit'>
        {submitString}
      </SquareButton>
    </form>
  )
}
