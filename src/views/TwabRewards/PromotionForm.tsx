import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { isAddress, parseUnits } from 'ethers/lib/utils'
import { useForm } from 'react-hook-form'
import { TokenIcon, SquareButton, Tooltip } from '@pooltogether/react-components'
import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { DatePicker, TimePicker } from 'antd'
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

  const [dateString, setDateString] = useState('')
  const [timeString, setTimeString] = useState('')

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
  const startTimestamp = getValues('startTimestamp')
  console.log({ startTimestamp })

  const tokenAddress = getValues('token')
  const { data: tokenData } = useTokenBalance(chainId, usersAddress, tokenAddress)
  const tokenAddressIsValid = tokenData?.name && tokenAddress && !Boolean(errors.token?.message)

  register('dateString', { value: '' })
  register('timeString', { value: '' })

  const clearTokenField = () => {
    setValue('token', '')
  }

  const updateStartTimestamp = async () => {
    console.log('######## LAST ###########')
    const dateString = getValues('dateString')
    const timeString = getValues('timeString')

    console.log(dateString)
    console.log(timeString)
    const dateTimeString = `${dateString}:${timeString}`
    console.log({ dateTimeString })
    console.log(Date.parse(dateTimeString))
    setValue('startTimestamp', Date.parse(dateString) / 1000)
  }

  const handleDateChange = async (val, dateString) => {
    console.log('######## DATE ###########')

    console.log(dateString)
    console.log(Date.parse(dateString))
    setValue('dateString', dateString)
    // await setDateString(dateString)
    updateStartTimestamp()
  }

  const handleTimeChange = async (val, timeString) => {
    console.log('######## TIME ###########')

    console.log({ timeString })
    setValue('timeString', timeString)
    // setTimeString(timeString)
    updateStartTimestamp()
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

      <DatePicker
        onChange={handleDateChange}
        getPopupContainer={(triggerNode): HTMLElement => {
          return triggerNode.parentNode as HTMLElement
        }}
      />
      <TimePicker
        onChange={handleTimeChange}
        getPopupContainer={(triggerNode): HTMLElement => {
          return triggerNode.parentNode as HTMLElement
        }}
      />

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
              id='tokensPerEpoch'
              invalid={!!errors.tokensPerEpoch}
              className='w-1/3'
              placeholder='0'
              {...register('tokensPerEpoch', {
                required: {
                  value: true,
                  message: 'Tokens per epoch is required'
                },
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: 'Minimum Tokens per epoch is 1'
                }
              })}
            />{' '}
            <div className='ml-4 font-semibold text-pt-purple-light'>{tokenData.name}</div>
          </div>
          <ErrorMessage>{errors.tokensPerEpoch?.message}</ErrorMessage>
          <Label className='uppercase' htmlFor='balance'>
            Number of epochs:
          </Label>
          <StyledInput
            id='numberOfEpochs'
            invalid={!!errors.numberOfEpochs}
            className='w-1/3'
            placeholder='10'
            {...register('numberOfEpochs', {
              required: {
                value: true,
                message: 'Number of epochs is required'
              },
              valueAsNumber: true,
              validate: {
                isNumber: (v) => !isNaN(Number(v)) || 'Number of epochs must be a number',
                isPositive: (v) => Number(v) >= 0 || 'Number of epochs must be a positive number'
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
