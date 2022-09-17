import { StyledInput } from '@components/Input'
import { SquareButton, SquareButtonSize } from '@pooltogether/react-components'
import { useConnectWallet } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { isAddress } from 'ethers/lib/utils'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { useForm } from 'react-hook-form'
import { DelegationListProps } from '.'

/**
 *
 * @param props
 * @returns
 */
export const NoDelegatorState: React.FC<DelegationListProps> = (props) => {
  const { className, setDelegator } = props
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<{ delegator: string }>({
    mode: 'onTouched',
    defaultValues: { delegator: '' },
    shouldUnregister: true
  })

  const onSubmit = (v: { delegator: string }) => {
    setDelegator(v.delegator)
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
        <p className='font-bold mb-1'>{t('connectToViewDelegations')}:</p>
        <ConnectWalletButton />
      </div>
      <div
        className={classNames(
          'rounded-lg py-8 px-4 xs:px-20 text-center flex-col items-center bg-pt-purple-dark mt-4'
        )}
      >
        <p className='font-bold mb-4 text-xs'>... {t('orEnterAnAddressToViewDelegations')}:</p>
        <form onSubmit={handleSubmit((v) => onSubmit(v))} autoComplete='off'>
          <StyledInput
            id='delegator'
            invalid={!!errors.delegator}
            className='w-full mb-4'
            placeholder='0xabc...'
            {...register('delegator', {
              required: {
                value: true,
                message: t('delegatorRequired')
              },
              validate: {
                isAddress: (v) => isAddress(v) || (t('invalidAddress') as string)
              }
            })}
          />
          <SquareButton className='w-full' disabled={!isValid}>
            {t('viewDelegations')}
          </SquareButton>
        </form>
      </div>
    </>
  )
}

const ConnectWalletButton = () => {
  const { t } = useTranslation()
  const connectWallet = useConnectWallet()

  return (
    <SquareButton
      size={SquareButtonSize.sm}
      className='flex flex-col mx-auto mt-3'
      onClick={() => connectWallet()}
    >
      {t('connectWallet')}
    </SquareButton>
  )
}
