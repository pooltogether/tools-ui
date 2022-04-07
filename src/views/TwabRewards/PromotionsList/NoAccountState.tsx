import React from 'react'
import classNames from 'classnames'
import { useForm } from 'react-hook-form'
import { isAddress } from 'ethers/lib/utils'
import { SquareButton } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import { StyledInput } from '@components/Input'
import { FullWalletConnectionButtonWrapper } from '@components/FullWalletConnectionButtonWrapper'
import { PromotionsListProps } from '.'

/**
 *
 * @param props
 * @returns
 */
export const NoAccountState: React.FC<PromotionsListProps> = (props) => {
  const { className, setCurrentAccount } = props
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<{ address: string }>({
    mode: 'onTouched',
    defaultValues: { address: '' },
    shouldUnregister: true
  })

  const onSubmit = (v: { address: string }) => {
    setCurrentAccount(v.address)
  }

  return (
    <>
      <div
        className={classNames(
          className,
          'rounded-lg py-8 px-4 xs:px-20 text-center flex-col items-center bg-darkened'
        )}
      >
        <p className='text-pt-purple-dark dark:text-pt-purple-light mb-2'>
          {t('noWalletConnectedText')}
        </p>
        <p className='font-bold mb-1'>
          {t('connectToViewPromotions', 'Connect to view Promotions & Rewards')}:
        </p>

        <FullWalletConnectionButtonWrapper className='flex flex-col items-center mt-3' />
      </div>
      <div
        className={classNames(
          'rounded-lg py-8 px-4 xs:px-20 text-center flex-col items-center bg-pt-purple-dark mt-4'
        )}
      >
        <p className='font-bold mb-4 text-xs'>
          ...{' '}
          {t(
            'orEnterAnAddressToViewPromotionsAndRewards',
            'Or enter an address to view Promotions and Rewards'
          )}
          :
        </p>
        <form onSubmit={handleSubmit((v) => onSubmit(v))} autoComplete='off'>
          <StyledInput
            id='address'
            invalid={!!errors.address}
            className='w-full mb-4'
            placeholder='0xabc...'
            {...register('address', {
              required: {
                value: true,
                message: t('addressRequired')
              },
              validate: {
                isAddress: (v) => isAddress(v) || (t('invalidAddress') as string)
              }
            })}
          />
          <SquareButton className='w-full' disabled={!isValid}>
            {t('viewAccount')}
          </SquareButton>
        </form>
      </div>
    </>
  )
}
