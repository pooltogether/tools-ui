import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { isAddress, parseUnits } from 'ethers/lib/utils'
import { useForm } from 'react-hook-form'
import { TokenIcon, SquareButton, Tooltip } from '@pooltogether/react-components'
import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
// import { useMaxLockDuration } from './hooks/useMaxLockDuration'

import { PromotionFormValues } from '@twabRewards/interfaces'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { useTicket } from '@hooks/v4/useTicket'

interface PromotionFormProps {
  onSubmit: (data: PromotionFormValues, resetForm: () => void) => void
  defaultValues: PromotionFormValues
  submitString: string
  chainId: number
}

/**
 *
 * @param props
 * @returns
 */
export const PromotionForm: React.FC<PromotionFormProps> = (props) => {
  const { onSubmit, defaultValues, submitString, chainId } = props

  const usersAddress = useUsersAddress()
  // const { data: maxLockDuration, isFetched: isMaxLockFetched } = useMaxLockDuration(chainId)

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isValid }
  } = useForm<PromotionFormValues>({
    mode: 'onTouched',
    defaultValues,
    shouldUnregister: true
  })
  const tokenAddress = getValues('token')
  const { data: tokenData } = useTokenBalance(chainId, usersAddress, tokenAddress)
  const tokenAddressIsValid = tokenData?.name && tokenAddress && !Boolean(errors.token?.message)

  const clearTokenField = () => {
    setValue('token', '')
  }

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v, reset))}
      className='flex flex-col'
      autoComplete='off'
    >
      <Label className='uppercase' htmlFor='token'>
        Token to distribute
      </Label>
      <div
        className={classNames(
          'bg-pt-purple-darkest rounded-xl px-4 py-2 flex items-center justify-between font-semibold',
          {
            hidden: !tokenAddressIsValid
          }
        )}
      >
        <div className='flex items-center'>
          {tokenData?.address && (
            <TokenIcon
              sizeClassName='w-4 h-4'
              className='mr-2'
              chainId={chainId}
              address={tokenData?.address}
            />
          )}
          {tokenData?.name}
        </div>
        <button
          onClick={clearTokenField}
          className='inline-flex items-center font-semibold underline text-pt-teal ml-3'
        >
          <FeatherIcon icon='x' className='w-3 h-3 mr-1' /> Change token
        </button>
      </div>
      <StyledInput
        id='token'
        invalid={!!errors.token}
        className={classNames('w-full', {
          hidden: tokenAddressIsValid
        })}
        placeholder='0xabc...'
        {...register('token', {
          required: {
            value: true,
            message: 'Token is required'
          },
          validate: {
            isAddress: (v) => isAddress(v) || 'Invalid address'
          }
        })}
      />
      <ErrorMessage>{errors.token?.message}</ErrorMessage>

      <Label className='uppercase' htmlFor='balance'>
        Promotion start time:
      </Label>
      <StyledInput
        id='startTimestamp'
        invalid={!!errors.startTimestamp}
        className='w-1/3'
        placeholder='10'
        {...register('startTimestamp', {
          required: {
            value: true,
            message: 'Start time is required'
          },
          validate: {
            isNumber: (v) => !isNaN(Number(v)) || 'Start time must be a number',
            // isValidBigNumber: (v) => {
            //   try {
            //     parseUnits(v, tokenData.decimals)
            //     return true
            //   } catch (e) {
            //     return 'Invalid startTime'
            //   }
            // },
            isPositive: (v) => Number(v) >= 0 || 'Balance must be a positive number'
          }
        })}
      />
      <ErrorMessage>{errors.startTimestamp?.message}</ErrorMessage>

      {tokenAddressIsValid && (
        <>
          <Tooltip id={`promo-form-epoch-duration-tooltip`} tip={'Enter 0.5 for 12 hours, etc'}>
            <div className='col-span-2 flex space-x-2 items-center'>
              <Label className='uppercase' htmlFor='duration'>
                Epoch Duration (Days)
              </Label>
              <FeatherIcon icon={'help-circle'} className='w-4 h-4 opacity-70' />
            </div>
          </Tooltip>
          <StyledInput
            id='epochDuration'
            invalid={!!errors.epochDuration}
            className='w-1/3'
            placeholder='0'
            {...register('epochDuration', {
              required: {
                value: true,
                message: 'Epoch Duration is required'
              },
              valueAsNumber: true,
              min: {
                value: 0.001,
                message: 'Minimum Epoch Duration of 0.001 days'
              },
              max: {
                value: 30,
                message: `Maximum duration of ${30} days`
              }
            })}
          />
          <ErrorMessage>{errors.epochDuration?.message}</ErrorMessage>
          <div className='col-span-2 flex space-x-2 items-center'>
            <Label className='uppercase' htmlFor='duration'>
              Tokens per epoch
            </Label>
          </div>
          <div className='flex space-x-2 items-center'>
            <StyledInput
              id='epochDuration'
              invalid={!!errors.epochDuration}
              className='w-1/3'
              placeholder='0'
              {...register('epochDuration', {
                required: {
                  value: true,
                  message: 'Epoch Duration is required'
                },
                valueAsNumber: true,
                min: {
                  value: 0.001,
                  message: 'Minimum Epoch Duration of 0.001 days'
                },
                max: {
                  value: 30,
                  message: `Maximum duration of ${30} days`
                }
              })}
            />{' '}
            <div className='ml-4 font-semibold text-pt-purple-light'>USDC</div>
          </div>
          <ErrorMessage>{errors.epochDuration?.message}</ErrorMessage>
          <Label className='uppercase' htmlFor='balance'>
            Number of epochs:
          </Label>
          <StyledInput
            id='startTime'
            invalid={!!errors.startTimestamp}
            className='w-1/3'
            placeholder='10'
            {...register('startTimestamp', {
              required: {
                value: true,
                message: 'Start time is required'
              },
              validate: {
                isNumber: (v) => !isNaN(Number(v)) || 'Start time must be a number',
                // isValidBigNumber: (v) => {
                //   try {
                //     parseUnits(v, tokenData.decimals)
                //     return true
                //   } catch (e) {
                //     return 'Invalid start time'
                //   }
                // },
                isPositive: (v) => Number(v) >= 0 || 'Balance must be a positive number'
              }
            })}
          />
          <ErrorMessage>{errors.startTimestamp?.message}</ErrorMessage>
        </>
      )}

      <SquareButton className='mt-4' disabled={!isValid} type='submit'>
        {submitString}
      </SquareButton>
    </form>
  )
}

const ErrorMessage: React.FC<{ className?: string }> = (props) => {
  return (
    <p
      {...props}
      className={classNames(props.className, 'xs:h-5 xs:block mt-1 text-xxs text-pt-red-light', {
        'h-5 mb-4': Boolean(props.children),
        'mb-0 h-1': !Boolean(props.children)
      })}
    />
  )
}
