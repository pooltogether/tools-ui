import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { BigNumber } from 'ethers'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import { TransactionResponse } from '@ethersproject/providers'
import { TransactionButton } from '@components/Buttons/TransactionButton'
import { format } from 'date-fns'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { msToS } from '@pooltogether/utilities'
import { useTokenBalance } from '@pooltogether/hooks'
import { Banner, BannerTheme, BottomSheet, BottomSheetTitle } from '@pooltogether/react-components'
import { ModalApproveGate } from '@components/ModalApproveGate'
import {
  useSendTransaction,
  useTransaction,
  useWalletSigner,
  useUsersAddress
} from '@pooltogether/wallet-connection'

import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { REWARDS_LEARN_MORE_URL } from '@twabRewards/constants'
import { PromotionForm } from '@twabRewards/PromotionForm'
import { Promotion, PromotionFormValues } from '@twabRewards/interfaces'
import { PromotionSummary } from '@twabRewards/PromotionSummary'
import { useIsBalanceSufficient } from '@twabRewards/hooks/useIsBalanceSufficient'
import { useTwabRewardsTokenAllowance } from '@twabRewards/hooks/useTwabRewardsTokenAllowance'
import { getTwabRewardsContract } from '@twabRewards/utils/getTwabRewardsContract'

enum CreatePromotionModalState {
  'FORM',
  'REVIEW',
  'RECEIPT'
}

export const CreatePromotionModal: React.FC<{
  chainId: number
  transactionId: string
  transactionPending: boolean
  setTransactionId: (transactionId: string) => void
  refetchAccountsPromotions: () => void
}> = (props) => {
  const {
    chainId,
    transactionId,
    transactionPending,
    setTransactionId,
    refetchAccountsPromotions
  } = props

  const { t } = useTranslation()
  const transaction = useTransaction(transactionId)
  const [isOpen, setIsOpen] = useAtom(createPromotionModalOpenAtom)
  const [params, setParams] = useState(undefined)
  const [modalState, setModalState] = useState(CreatePromotionModalState.FORM)
  const isBalanceSufficient = useIsBalanceSufficient(chainId, params?.tokensPerEpoch, params?.token)

  const { allowanceOk, twabRewardsAllowanceRefetch } = useTwabRewardsTokenAllowance(chainId, params)
  const usersAddress = useUsersAddress()
  const amountUnformatted = params?.tokensPerEpoch.mul(params.numberOfEpochs)

  const { data: tokenData, isFetched: tokenDataIsFetched } = useTokenBalance(
    chainId,
    usersAddress,
    params?.token
  )

  const setFormView = () => {
    setModalState(CreatePromotionModalState.FORM)
  }

  const setReviewView = () => {
    setModalState(CreatePromotionModalState.REVIEW)
  }

  const setReceiptView = () => {
    setModalState(CreatePromotionModalState.RECEIPT)
  }

  const dismissModal = () => {
    setIsOpen(false)
    setFormView()
  }

  let content
  if (modalState === CreatePromotionModalState.FORM) {
    content = (
      <>
        <BottomSheetTitle chainId={chainId} title={t('createPromotion', 'Create promotion')} />
        <CreatePromotionForm
          chainId={chainId}
          setReviewView={setReviewView}
          setParams={setParams}
        />
      </>
    )
  } else if (modalState === CreatePromotionModalState.REVIEW) {
    if (!allowanceOk) {
      content = (
        <>
          <BottomSheetTitle
            chainId={chainId}
            title={t('allowTicker', { ticker: tokenData?.name })}
          />
          <ModalApproveGate
            className='mt-8'
            chainId={chainId}
            amountUnformatted={amountUnformatted}
            token={params?.token}
            tokenData={tokenData}
            twabRewardsAllowanceRefetch={twabRewardsAllowanceRefetch}
          />
        </>
      )
    } else {
      content = (
        <div className='flex flex-col space-y-4'>
          <BottomSheetTitle
            chainId={chainId}
            title={t('createPromotionConfirmation', 'Create Promotion confirmation')}
          />
          <TokenBalanceWarning chainId={chainId} isBalanceSufficient={isBalanceSufficient} />
          <PromotionFundsLockWarning />
          <div className='text-xs font-bold pt-4'>
            <div className='capitalize'>{t('review')}:</div>
            <PromotionSummary {...params} chainId={chainId} />
          </div>

          <SubmitTransactionButton
            chainId={chainId}
            params={params}
            transactionPending={transactionPending}
            isBalanceSufficient={isBalanceSufficient}
            dismissModal={dismissModal}
            setReceiptView={setReceiptView}
            setIsOpen={setIsOpen}
            setTransactionId={setTransactionId}
            refetchAccountsPromotions={refetchAccountsPromotions}
          />
        </div>
      )
    }
  } else {
    content = (
      <div className='flex flex-col space-y-12'>
        <BottomSheetTitle
          chainId={chainId}
          title={t('createPromotionTransactionSubmitted', 'Create promotion transaction submitted')}
        />
        <TransactionReceiptButton chainId={chainId} transaction={transaction} />
      </div>
    )
  }

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={dismissModal}>
      {content}
    </BottomSheet>
  )
}

/**
 * @param props
 * @returns
 */
const CreatePromotionForm: React.FC<{
  chainId: number
  setReviewView: () => void
  setParams: (value: Promotion) => void
}> = (props) => {
  const { chainId, setReviewView, setParams } = props
  const { t } = useTranslation()

  const onSubmit = (data: PromotionFormValues, resetForm: () => void) => {
    const { tokensPerEpoch, epochDuration, numberOfEpochs, startTimestamp, token, tokenDecimals } =
      data

    const params: Promotion = {
      epochDuration,
      numberOfEpochs,
      startTimestamp: Math.round(startTimestamp),
      token,
      tokensPerEpoch: parseUnits(tokensPerEpoch, tokenDecimals)
    }
    setParams(params)

    setReviewView()
  }

  return (
    <PromotionForm
      chainId={chainId}
      onSubmit={onSubmit}
      defaultValues={{
        token: '',
        startTimestamp: msToS(Date.now()),
        epochDuration: 7,
        numberOfEpochs: 12,
        tokensPerEpoch: '1000',
        dateString: format(new Date(), 'yyyy/MM/dd'),
        timeString: format(new Date(), 'HH:mm'),
        tokenDecimals: null
      }}
      submitString={t('reviewPromotion', 'Review promotion')}
    />
  )
}

interface SubmitTransactionButtonProps {
  chainId: number
  params: Promotion
  transactionPending: boolean
  isBalanceSufficient: boolean
  dismissModal: () => void
  setReceiptView: () => void
  setIsOpen: (isOpen: boolean) => void
  setTransactionId: (id: string) => void
  refetchAccountsPromotions: () => void
}

/**
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    params,
    transactionPending,
    isBalanceSufficient,
    setReceiptView,
    dismissModal,
    setIsOpen,
    setTransactionId,
    refetchAccountsPromotions
  } = props

  const { tokensPerEpoch, numberOfEpochs, epochDuration, startTimestamp, token } = params

  const signer = useWalletSigner()
  const usersAddress = useUsersAddress()
  const { allowanceOk, isAllowanceFetched } = useTwabRewardsTokenAllowance(chainId, params)
  const { t } = useTranslation()

  const sendTransaction = useSendTransaction(chainId, usersAddress)

  const submitUpdateTransaction = async () => {
    const twabRewardsContract = getTwabRewardsContract(chainId, signer)

    let callTransaction: () => Promise<TransactionResponse>

    try {
      callTransaction = async () =>
        twabRewardsContract.createPromotion(
          token,
          BigNumber.from(startTimestamp),
          tokensPerEpoch,
          BigNumber.from(epochDuration),
          BigNumber.from(numberOfEpochs)
        )
    } catch (e) {
      console.error(e)
      return
    }

    const transactionId = sendTransaction(t('createPromotion'), callTransaction, {
      onConfirmed: () => {
        setReceiptView()
      },
      onSuccess: async () => {
        setIsOpen(false)
        dismissModal()
        refetchAccountsPromotions()
      }
    })
    setTransactionId(transactionId)
  }

  const disabled =
    !signer || !isAllowanceFetched || !allowanceOk || transactionPending || !isBalanceSufficient

  return (
    <TransactionButton
      className='w-full'
      onClick={submitUpdateTransaction}
      disabled={disabled}
      pending={transactionPending}
      chainId={chainId}
      toolTipId={'create-promotion-btn-tooltip'}
    >
      {t('createPromotion')}
    </TransactionButton>
  )
}

const TokenBalanceWarning: React.FC<{ isBalanceSufficient: boolean; chainId: number }> = (
  props
) => {
  const { isBalanceSufficient, chainId } = props
  const { t } = useTranslation()

  if (isBalanceSufficient === null || isBalanceSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>
        {t(
          'tokensPerEpochAmountTooLarge',
          'The tokens you have requested to send via this promotion is more than your balance'
        )}
      </p>
      {/* <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={getChainSwapUrl(chainId)}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('swap')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a> */}
    </Banner>
  )
}

const PromotionFundsLockWarning: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-yellow' />
      <p className='text-xs'>
        {t(
          'createPromotionConfirmationDescription',
          `By delegating you are locking up your funds for the expiry period and relinquishing your chances of winning to gift those chances to other wallet addresses. `
        )}
      </p>
      <a
        className='transition text-pt-teal dark:hover:text-white underline hover:underline flex items-center space-x-1'
        href={REWARDS_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMoreAboutPromotions', 'Learn more about PoolTogether Promotions')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}
