import { TxButton } from '@components/Buttons/TxButton'
import { StyledInput } from '@components/Input'
import { useRetroactivePoolClaimData } from '@pooltogether/hooks'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import { shorten } from '@pooltogether/utilities'
import {
  Transaction,
  useIsWalletConnected,
  useSendTransaction,
  useTransaction
} from '@pooltogether/wallet-connection'
import { Contract } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useSigner } from 'wagmi'
import MerkleDistributorAbi from './abis/MerkleDistributor'
import { MERKLE_DISTRIBUTOR_ADDRESS } from './config'
import { AirdropClaimFormValues } from './interfaces'
import { getAirdropClaimChainId } from './utils/getAirdropClaimChainId'

export const AirdropClaimForm = () => {
  const methods = useForm<AirdropClaimFormValues>({
    mode: 'onChange',
    defaultValues: { confirm1: false, confirm2: false, address: '' },
    shouldUnregister: true
  })

  const address = methods.watch('address')

  const chainId = getAirdropClaimChainId()
  const { data, refetch } = useRetroactivePoolClaimData(address)
  const [transactionId, setTransactionId] = useState<string>()
  const transaction = useTransaction(transactionId)
  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const { t } = useTranslation()

  const handleClaim = async () => {
    const txName = t('claimPoolForAddress', {
      address: shorten({ hash: address, short: true })
    })
    const merkleDistributor = new Contract(
      MERKLE_DISTRIBUTOR_ADDRESS[chainId],
      MerkleDistributorAbi,
      signer
    )

    const id = await sendTransaction({
      name: txName,
      callTransaction: () => merkleDistributor.claim(data.index, address, data.amount, data.proof),
      callbacks: {
        onSuccess: () => {
          refetch()
        }
      }
    })
    setTransactionId(id)
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleClaim)}>
          <div className='flex flex-col space-y-6'>
            <FirstConfirmation />
            <SecondConfirmation />
            <AddressGroup />
            <ClaimButton transaction={transaction} />
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

const FirstConfirmation = () => {
  const { t } = useTranslation()
  return (
    <CheckboxGroup
      name='confirm1'
      label={t('iUnderstandReceivingTokens')}
      description={t('receivingPoolDescription')}
    />
  )
}
const SecondConfirmation = () => {
  const { t } = useTranslation()
  return (
    <CheckboxGroup
      name='confirm2'
      label={t('iUnderstandWhatTokensDo')}
      description={t('whatTokensDoDescription')}
    />
  )
}

const CheckboxGroup: React.FC<{
  name: 'confirm1' | 'confirm2'
  label: string
  description: string
}> = (props) => {
  const { name, label, description } = props
  const { register } = useFormContext<AirdropClaimFormValues>()

  return (
    <div className='flex flex-col space-y-2'>
      <p className='text-xs opacity-70'>{description}</p>
      <div className='flex flex-row space-x-2 items-center w-full py-2 px-4 bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-lg'>
        <input
          type='checkbox'
          {...register(name, {
            required: true
          })}
        />
        <label className='flex items-center font-semibold xs:text-lg'>{label}</label>
      </div>
    </div>
  )
}

const AddressGroup = () => {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext<AirdropClaimFormValues>()
  const { t } = useTranslation()

  const firstConfirmation = watch('confirm1')
  const secondConfirmation = watch('confirm2')

  return (
    <div className='flex flex-col space-y-2'>
      <p className='text-xs opacity-70'>{t('claimingFor')}</p>
      <StyledInput
        id='address'
        invalid={!!errors.address}
        disabled={!firstConfirmation || !secondConfirmation}
        className='w-full bg-white dark:bg-actually-black dark:bg-opacity-10'
        placeholder='0xabc...'
        {...register('address', {
          required: {
            value: true,
            message: 'Address is required'
          },
          validate: {
            isAddress: (v) => isAddress(v) || (t('invalidAddress') as string)
          }
        })}
      />
    </div>
  )
}

const ClaimButton: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props
  const { t } = useTranslation()
  const isWalletConnected = useIsWalletConnected()
  const chainId = getAirdropClaimChainId()
  const {
    watch,
    formState: { isValid }
  } = useFormContext<AirdropClaimFormValues>()
  const address = watch('address')

  const { data, isFetched, isFetching } = useRetroactivePoolClaimData(address)
  const disabled =
    !isValid || !isWalletConnected || !isFetched || data?.isClaimed || data?.isMissing

  return (
    <div className='flex flex-col space-y-2'>
      <div className='h-5'>
        {!isFetched ? (
          <div className='opacity-50 flex items-center space-x-1'>
            {isFetching && <ThemedClipSpinner sizeClassName='w-3 h-3' />}
          </div>
        ) : data.isClaimed ? (
          <div>
            <span>{`${data?.formattedAmount} ${t('poolClaimed')}`}</span>
          </div>
        ) : (
          <div>
            <span>{`${data?.formattedAmount} ${t('claimablePool')}`}</span>
          </div>
        )}
      </div>
      <TxButton
        type={disabled ? 'button' : 'submit'}
        disabled={disabled}
        chainId={chainId}
        className='w-full'
        state={transaction?.state}
        status={transaction?.status}
      >
        {!isFetched || !data.isClaimed ? t('claimPool') : t('poolClaimed')}
      </TxButton>
    </div>
  )
}
