import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { LoadingLogo, SquareButton } from '@pooltogether/react-components'
import classNames from 'classnames'
import { isAddress } from 'ethers/lib/utils'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { DelegationListProps } from '.'

/**
 *
 * @param props
 * @returns
 */
export const NoDelegatorState: React.FC<DelegationListProps> = (props) => {
  const { className, setDelegator } = props

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<{ delegator: string }>({
    mode: 'onTouched',
    defaultValues: { delegator: '' },
    shouldUnregister: true
  })

  const router = useRouter()

  const onSubmit = (v: { delegator: string }) => {
    setDelegator(v.delegator)
  }

  return (
    <div
      className={classNames(
        className,
        'rounded-lg py-8 px-4 xs:px-20 text-center flex-col items-center bg-darkened'
      )}
    >
      <p className='text-pt-purple-dark dark:text-pt-purple-light mb-2'>No Wallet Connected</p>
      <p className='font-bold mb-1'>Connect a wallet to view your delegations</p>
      <hr />
      <p className='font-bold mb-4'>Enter an address below to view it's delegations</p>
      <form onSubmit={handleSubmit((v) => onSubmit(v))} autoComplete='off'>
        <StyledInput
          id='delegator'
          invalid={!!errors.delegator}
          className='w-full mb-4'
          placeholder='0xabc...'
          {...register('delegator', {
            required: {
              value: true,
              message: 'Delegator is required'
            },
            validate: {
              isAddress: (v) => isAddress(v) || 'Invalid address'
            }
          })}
        />
        <SquareButton className='w-full' disabled={!isValid}>
          View Delegations
        </SquareButton>
      </form>
    </div>
  )
}
