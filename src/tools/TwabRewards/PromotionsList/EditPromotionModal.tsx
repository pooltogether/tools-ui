import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { BottomSheet, Button, ButtonTheme, ModalTitle } from '@pooltogether/react-components'
import { formatNumberForDisplay } from '@pooltogether/utilities'
import {
  TransactionState,
  TransactionStatus,
  useSendTransaction,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSigner } from 'wagmi'
import { TransactionReceiptButton } from '../../../components/Buttons/TransactionReceiptButton'
import { TxButton } from '../../../components/Buttons/TxButton'
import { StyledInput } from '../../../components/Input'
import { Label } from '../../../components/Label'
import { ModalApproveGate } from '../../../components/ModalApproveGate'
import { useTwabRewardsTokenAllowance } from '../hooks/useTwabRewardsTokenAllowance'
import { Promotion } from '../interfaces'
import { getTwabRewardsContract } from '../utils/getTwabRewardsContract'

// TODO: Disable for non-user
export const EditPromotionModal = (props: {
  isOpen: boolean
  closeModal: () => void
  chainId: number
  promotion: Promotion
  currentAccount: string
}) => {
  const { isOpen, closeModal, chainId, promotion, currentAccount } = props

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<{ epochs: number }>({
    mode: 'onTouched',
    defaultValues: {
      epochs: 1
    }
  })

  const usersAddress = useUsersAddress()

  const additionalEpochs = watch('epochs')
  const additionalTokensNeeded = BigNumber.from(promotion?.tokensPerEpoch).mul(
    additionalEpochs || 0
  )
  const { allowance, isAllowanceFetched, twabRewardsAllowanceRefetch } =
    useTwabRewardsTokenAllowance(chainId, promotion)
  const isAllowanceValid = allowance?.gte(additionalTokensNeeded)
  const { data: tokenData, isFetched: tokenDataIsFetched } = useTokenBalance(
    chainId,
    usersAddress,
    promotion?.token
  )

  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const [transactionId, setTransactionId] = useState<string>('')
  const transaction = useTransaction(transactionId)

  const submitExtendTransaction = () => {
    const twabRewardsContract = getTwabRewardsContract(chainId, signer)

    setTransactionId(
      sendTransaction({
        name: 'Extend Promotion',
        callTransaction: () => twabRewardsContract.extendPromotion(promotion.id, additionalEpochs),
        callbacks: {
          onConfirmedByUser: () => reset()
        }
      })
    )
  }

  const disableExtend =
    !isAllowanceFetched ||
    !tokenDataIsFetched ||
    !isAllowanceValid ||
    !isValid ||
    usersAddress !== currentAccount

  return (
    <BottomSheet isOpen={isOpen} closeModal={closeModal} className='flex flex-col space-y-4'>
      <ModalTitle chainId={chainId} title='Extend Promotion' />
      <form>
        <Label className='uppercase' htmlFor='epochs'>
          Additional Epochs
        </Label>
        <StyledInput
          id='epochs'
          invalid={!!errors.epochs}
          className='w-full'
          disabled={!!transaction}
          {...register('epochs', {
            required: {
              value: true,
              message: 'Additional epochs are required'
            },
            valueAsNumber: true,
            min: {
              value: 1,
              message: 'Minimum extension of 1 epoch'
            }
          })}
        />
        <p className='h-5 mt-1 text-xxs text-pt-red-light'>
          {!!errors?.epochs?.message && typeof errors.epochs.message === 'string'
            ? errors.epochs.message
            : null}
        </p>
      </form>
      <div className='pb-6'>
        <div className='rounded bg-actually-black bg-opacity-30 p-4 text-center'>
          <span>
            <b>{additionalEpochs || 0}</b> more epochs requires{' '}
            <b>
              {formatNumberForDisplay(formatUnits(additionalTokensNeeded, tokenData?.decimals))}{' '}
              {tokenData?.symbol}
            </b>
          </span>
        </div>
      </div>
      {!isAllowanceValid && (
        <>
          <ModalApproveGate
            chainId={chainId}
            amountUnformatted={additionalTokensNeeded}
            token={promotion?.token}
            tokenData={tokenData}
            twabRewardsAllowanceRefetch={twabRewardsAllowanceRefetch}
          />
        </>
      )}
      {(!transaction || transaction.state === TransactionState.pending) && (
        <TxButton
          disabled={disableExtend}
          chainId={chainId}
          onClick={submitExtendTransaction}
          state={transaction?.state}
          status={transaction?.status}
        >
          Extend Promotion
        </TxButton>
      )}
      {!!transaction?.response?.hash && (
        <TransactionReceiptButton transaction={transaction} chainId={chainId} />
      )}
      {transaction?.state === TransactionState.complete && (
        <Button
          theme={ButtonTheme.orangeOutline}
          onClick={() => {
            reset()
            setTransactionId('')
          }}
        >
          Reset Form
        </Button>
      )}
    </BottomSheet>
  )
}
