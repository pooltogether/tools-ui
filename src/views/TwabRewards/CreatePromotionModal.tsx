import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { BigNumber } from 'ethers'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import { toast } from 'react-toastify'
import { TransactionResponse } from '@ethersproject/providers'
import { TransactionButton } from '@components/Buttons/TransactionButton'
import { format } from 'date-fns'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { msToS } from '@pooltogether/utilities'
import { useTokenAllowance } from '@pooltogether/hooks'
import { Banner, BannerTheme, BottomSheet, BottomSheetTitle } from '@pooltogether/react-components'
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
import { getTwabRewardsContract } from '@twabRewards/utils/getTwabRewardsContract'
import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'
// import { buildApproveTx } from '@twabRewards/transactions/buildApproveTx'
// import { buildCreateTx } from '@twabRewards/transactions/buildCreateTx'

enum CreatePromotionModalState {
  'FORM',
  'REVIEW',
  'RECEIPT'
}

export const CreatePromotionModal: React.FC<{
  chainId: number
  currentAccount: string
  transactionId: string
  transactionPending: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (transactionId: string) => void
}> = (props) => {
  const {
    chainId,
    currentAccount,
    transactionId,
    transactionPending,
    setSignaturePending,
    setTransactionId
  } = props

  const { t } = useTranslation()
  const transaction = useTransaction(transactionId)
  const [isOpen, setIsOpen] = useAtom(createPromotionModalOpenAtom)
  const [params, setParams] = useState(undefined)
  const [modalState, setModalState] = useState(CreatePromotionModalState.FORM)
  const isBalanceSufficient = useIsBalanceSufficient(chainId, params?.tokensPerEpoch, params?.token)

  const setFormView = () => {
    setModalState(CreatePromotionModalState.FORM)
  }

  const setReviewView = () => {
    setModalState(CreatePromotionModalState.REVIEW)
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
          currentAccount={currentAccount}
          transactionPending={transactionPending}
          isBalanceSufficient={isBalanceSufficient}
          setIsOpen={setIsOpen}
          setTransactionId={setTransactionId}
          setModalState={setModalState}
          // setListState={setListState}
          setSignaturePending={setSignaturePending}
        />
      </div>
    )
  } else {
    content = (
      <div className='flex flex-col space-y-12'>
        <BottomSheetTitle chainId={chainId} title={t('delegationTransactionSubmitted')} />
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
  currentAccount: string
  transactionPending: boolean
  isBalanceSufficient: boolean
  setIsOpen: (isOpen: boolean) => void
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (id: string) => void
  setModalState: (modalState: CreatePromotionModalState) => void
  // setListState: (listState: ListState) => void
}

/**
 * https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    params,
    currentAccount,
    transactionPending,
    isBalanceSufficient,
    setIsOpen,
    setSignaturePending,
    setModalState,
    setTransactionId
  } = props

  const { tokensPerEpoch, numberOfEpochs, epochDuration, startTimestamp, token } = params

  const signer = useWalletSigner()
  const usersAddress = useUsersAddress()
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabRewardsAddress,
    token
  )
  // const { refetch: refetchTicketBalance } = useTokenBalance(chainId, currentAccount, token)
  // const { refetch: refetchDelegationBalance } = useTotalAmountDelegated(chainId, delegator)
  const { t } = useTranslation()

  const totalAmountToFund = tokensPerEpoch.mul(numberOfEpochs)

  const sendTransaction = useSendTransaction(chainId, usersAddress)

  const submitUpdateTransaction = async () => {
    const twabRewardsContract = getTwabRewardsContract(chainId, signer)
    // const ticketContract = getTicketContract(chainId)

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
      onSent: () => {},
      onConfirmed: () => {
        setModalState(CreatePromotionModalState.RECEIPT)
      },
      onSuccess: async () => {
        await refetch()
        setIsOpen(false)
        refetchTokenBalance()
        setModalState(CreatePromotionModalState.REVIEW)
      }
    })
    setTransactionId(transactionId)
  }

  const allowanceOk = !totalAmountToFund.isZero() && allowance?.gt(totalAmountToFund)

  return (
    <TransactionButton
      className='w-full'
      onClick={submitUpdateTransaction}
      disabled={
        !signer || !isAllowanceFetched || allowanceOk || transactionPending || !isBalanceSufficient
      }
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
