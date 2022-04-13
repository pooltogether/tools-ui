import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import moment from 'moment'
import { msToS, numberWithCommas } from '@pooltogether/utilities'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { isAddress, parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { DatePicker, TimePicker } from 'antd'
import { TokenIcon, SquareButton, Tooltip, ThemedClipSpinner } from '@pooltogether/react-components'

import { PromotionFormValues } from '@twabRewards/interfaces'
import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'

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
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid }
  } = useForm<PromotionFormValues>({
    mode: 'onTouched',
    defaultValues
  })

  register('dateString', { value: '' })
  register('timeString', { value: '' })
  // register('startTimestamp', {
  //   required: {
  //     value: true,
  //     message: 'Start time is required'
  //   },
  //   validate: {
  //     isNumber: (v) => !isNaN(Number(v)) || 'Start time must be a number',
  //     isPositive: (v) => Number(v) >= 0 || 'Start time must be a positive number'
  //   }
  // })

  const startTimestamp = getValues('startTimestamp')
  const tokensPerEpoch = watch('tokensPerEpoch')
  const epochDuration = watch('epochDuration')
  const numberOfEpochs = watch('numberOfEpochs')

  const tokenAddress = watch('token')
  const { data: tokenData, isFetched: tokenDataIsFetched } = useTokenBalance(
    chainId,
    usersAddress,
    tokenAddress
  )
  const tokenAddressIsValid = tokenAddress && !Boolean(errors.token?.message)

  const clearTokenField = () => {
    setValue('token', '')
  }

  const updateStartTimestamp = async () => {
    const date = getValues('dateString')
    const time = getValues('timeString')
    const dateTimeString = `${date}:${time}`
    setValue('startTimestamp', msToS(Date.parse(dateTimeString)))
    trigger()
  }

  const handleDateChange = async (val, dateString) => {
    setValue('dateString', dateString)
    updateStartTimestamp()
  }

  const handleTimeChange = async (val, timeString) => {
    setValue('timeString', timeString)
    updateStartTimestamp()
  }

  const dateFormat = 'YYYY-MM-DD'
  const timeFormat = 'HH:mm'

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v, reset))}
      className='flex flex-col'
      autoComplete='off'
    >
      <Label className='uppercase' htmlFor='token'>
        {t('tokenToDistribute', 'Token to distribute')}:{' '}
        {!tokenDataIsFetched && tokenAddressIsValid && <ThemedClipSpinner />}
      </Label>
      <ValidFieldDisplay hidden={!tokenAddressIsValid && !tokenData?.name}>
        <TokenDisplay chainId={chainId} tokenData={tokenData} />

        <button
          onClick={clearTokenField}
          className='inline-flex items-center font-semibold underline text-pt-teal ml-3'
        >
          <FeatherIcon icon='x' className='w-3 h-3 xs:w-5 xs:h-5 mr-1' />{' '}
          {t('changeToken', 'Change token')}
        </button>
      </ValidFieldDisplay>
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
            message: t('tokenIsRequired', 'Token is required')
          },
          validate: {
            isAddress: (v) => isAddress(v) || 'Invalid address'
          }
        })}
      />

      <ErrorMessage>{errors.token?.message}</ErrorMessage>

      <fieldset
        className={classNames('w-full', {
          hidden: !tokenAddressIsValid && !tokenData?.name
        })}
      >
        <Label className='uppercase' htmlFor='balance'>
          {t('promotionStartTime', 'Promotion start time')}:
        </Label>
        <div className='flex items-center space-x-1'>
          <DatePicker
            format={dateFormat}
            defaultValue={moment(format(new Date(), 'yyyy/MM/dd'), dateFormat)}
            onChange={handleDateChange}
            getPopupContainer={(triggerNode): HTMLElement => {
              return triggerNode.parentNode as HTMLElement
            }}
            className='w-40 xs:w-1/2'
          />
          <TimePicker
            format={timeFormat}
            defaultValue={moment(new Date().toTimeString().split(' ')[0], timeFormat)}
            onChange={handleTimeChange}
            getPopupContainer={(triggerNode): HTMLElement => {
              return triggerNode.parentNode as HTMLElement
            }}
            className='w-40 xs:w-1/2'
          />
        </div>
        <SummaryWell className='w-fit-content'>
          {format(new Date(startTimestamp * 1000), 'MMM do yyyy @ p')}
        </SummaryWell>

        <ErrorMessage>{errors.startTimestamp?.message}</ErrorMessage>
      </fieldset>

      <fieldset
        className={classNames('w-full', {
          hidden: !tokenAddressIsValid && !tokenData?.name
        })}
      >
        <div className='col-span-2 flex space-x-2 items-center'>
          <Label className='uppercase' htmlFor='duration'>
            {t('tokensPerEpoch', 'Tokens per epoch')}
          </Label>
        </div>
        <div className='flex space-x-2 items-center'>
          <StyledInput
            id='tokensPerEpoch'
            invalid={!!errors.tokensPerEpoch}
            className='w-1/3'
            placeholder='eg. 1000'
            {...register('tokensPerEpoch', {
              required: {
                value: true,
                message: t('tokensPerEpochIsRequired', 'Tokens per epoch is required')
              },
              min: {
                value: 0.01,
                message: t('minimumTokensPerEpochIsOne', 'Minimum tokens per epoch is 0.01')
              },
              validate: {
                isNumber: (v) => !isNaN(Number(v)) || 'Start time must be a number',
                isValidBigNumber: (v) => {
                  try {
                    parseUnits(v, tokenData.decimals)
                    return true
                  } catch (e) {
                    return 'Invalid startTime'
                  }
                },
                isPositive: (v) => Number(v) >= 0 || 'Balance must be a positive number'
              }
            })}
          />{' '}
          <div className='ml-4 font-semibold text-pt-purple-light flex items-center space-x-1'>
            <TokenDisplay chainId={chainId} tokenData={tokenData} />
          </div>
        </div>
        <ErrorMessage>{errors.tokensPerEpoch?.message}</ErrorMessage>
      </fieldset>

      <fieldset
        className={classNames('w-full', {
          hidden: !tokenAddressIsValid && !tokenData?.name
        })}
      >
        <div className='col-span-2 flex space-x-2 items-center'>
          <Label className='uppercase' htmlFor='duration'>
            {t('epochDuration', 'Epoch Duration')}:
          </Label>
          <Tooltip
            id={`promo-form-epoch-duration-tooltip`}
            tip={'For hours, enter 0.5 for 12 hours, etc'}
          >
            <FeatherIcon icon={'help-circle'} className='w-4 h-4 opacity-50' />
          </Tooltip>
        </div>
        <div className='flex space-x-2 items-center'>
          <StyledInput
            id='epochDuration'
            invalid={!!errors.epochDuration}
            className='w-1/3'
            placeholder='eg. 7'
            {...register('epochDuration', {
              required: {
                value: true,
                message: 'Epoch Duration in days is required'
              },
              valueAsNumber: true,
              max: {
                value: 30,
                message: `Maximum duration of ${30} days`
              },
              validate: {
                isNumber: (v) => !isNaN(Number(v)) || 'Epoch Duration must be a number',
                isPositive: (v) => Number(v) >= 0 || 'Epoch Duration must be a positive number'
              }
            })}
          />{' '}
          <div className='ml-4 font-semibold text-pt-purple-light'>{t('days')}</div>
        </div>
        <ErrorMessage>{errors.epochDuration?.message}</ErrorMessage>
      </fieldset>

      <fieldset
        className={classNames('w-full', {
          hidden: !tokenAddressIsValid && !tokenData?.name
        })}
      >
        <Label className='uppercase' htmlFor='balance'>
          {t('numberOfEpochs', 'Number of epochs')}:
        </Label>
        <StyledInput
          id='numberOfEpochs'
          invalid={!!errors.numberOfEpochs}
          className='w-1/3'
          placeholder='eg. 12'
          {...register('numberOfEpochs', {
            required: {
              value: true,
              message: 'Number of epochs is required'
            },
            valueAsNumber: true,
            pattern: /^[0-9]+$/,
            max: {
              value: 255,
              message: `Maximum number of epochs is 255`
            },
            validate: {
              isNumber: (v) => !isNaN(Number(v)) || 'Number of epochs must be a number',
              isPositive: (v) => Number(v) >= 0 || 'Number of epochs must be a positive number',
              wholeNumber: (v) =>
                /^[0-9]+$/.test(v.toString()) || 'Number of epochs must be a whole number'
            }
          })}
        />
        <ErrorMessage>{errors.numberOfEpochs?.message}</ErrorMessage>
      </fieldset>

      <SummaryWell hidden={!tokenAddressIsValid && !tokenData?.name} className='w-full'>
        <div className='flex items-center '>
          <span className='mr-1'>
            <strong>
              {numberOfEpochs ? numberOfEpochs : 'y'} {epochDuration ? epochDuration : 'x'}-day
            </strong>{' '}
            epochs will distribute
          </span>
          <span className='mr-1'>
            <strong>{Boolean(tokensPerEpoch) ? numberWithCommas(tokensPerEpoch) : 'n'}</strong>
          </span>{' '}
          <TokenDisplay chainId={chainId} tokenData={tokenData} />
        </div>
        {Boolean(numberOfEpochs) && Boolean(epochDuration) && Boolean(tokensPerEpoch) && (
          <div className='flex items-center space-x-2'>
            <span>
              <strong>
                Total: <span>{numberWithCommas(Number(tokensPerEpoch) * numberOfEpochs)} </span>
              </strong>
            </span>
            <TokenDisplay chainId={chainId} tokenData={tokenData} />
          </div>
        )}
      </SummaryWell>

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

const ValidFieldDisplay = (props) => {
  const { children, hidden } = props
  return (
    <div
      className={classNames(
        'bg-pt-purple-darker rounded-xl py-2 px-4 xs:py-3 xs:px-5 xs:text-lg flex items-center justify-between font-semibold',
        {
          hidden
        }
      )}
    >
      {children}
    </div>
  )
}

const SummaryWell = (props) => {
  const { className, children, hidden } = props
  return (
    <div
      className={classNames(
        className,
        'bg-opacity-40 mt-1 bg-pt-purple-dark px-3 py-1 rounded-lg text-white text-opacity-70',
        {
          hidden
        }
      )}
    >
      {children}
    </div>
  )
}

const TokenDisplay = (props) => {
  const { chainId, tokenData } = props
  if (!tokenData) {
    return null
  }
  return (
    <div className='inline-flex items-center text-white'>
      {tokenData?.address && (
        <TokenIcon
          sizeClassName='w-4 h-4'
          className='mr-2'
          chainId={chainId}
          address={tokenData?.address}
        />
      )}
      <span className='mr-1'>{tokenData?.name}</span>
    </div>
  )
}
