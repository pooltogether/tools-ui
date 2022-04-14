import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { Banner, BannerTheme, BottomSheet, BottomSheetTitle } from '@pooltogether/react-components'
import { msToS } from '@pooltogether/utilities'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import { Transaction } from '@pooltogether/hooks'
import { format } from 'date-fns'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import {
  useSendTransaction,
  useTransaction,
  useWalletSigner,
  useUsersAddress
} from '@pooltogether/wallet-connection'

import { REWARDS_LEARN_MORE_URL } from '@twabRewards/constants'
import { PromotionForm } from '@twabRewards/PromotionForm'
import { Promotion, PromotionFormValues } from '@twabRewards/interfaces'
import { useIsBalanceSufficient } from '@twabRewards/hooks/useIsBalanceSufficient'
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
  const { chainId, currentAccount } = props

  const [isOpen, setIsOpen] = useAtom(createPromotionModalOpenAtom)
  const [params, setParams] = useState(undefined)
  console.log({ params })

  const { t } = useTranslation()
  const [modalState, setModalState] = useState(CreatePromotionModalState.FORM)

  const isBalanceSufficient = useIsBalanceSufficient(chainId, params?.tokensPerEpoch, params?.token)

  const setReviewView = () => {
    setModalState(CreatePromotionModalState.REVIEW)
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
        <div>
          <p className='text-xs font-bold mb-1 capitalize'>{t('reviewChanges')}</p>
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
        {/* <TransactionReceiptButton chainId={chainId} transaction={transaction} /> */}
      </div>
    )
  }

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
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
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)
  const { data: delegations, refetch } = useDelegatorsTwabDelegations(chainId, delegator)
  const resetAtoms = useResetDelegationAtoms()
  const signer = useWalletSigner()
  const usersAddress = useUsersAddress()
  const ticket = useTicket(chainId)
  const twabDelegator = getTwabDelegatorContractAddress(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const { refetch: refetchTicketBalance } = useTokenBalance(chainId, delegator, ticket.address)
  const { refetch: refetchDelegationBalance } = useTotalAmountDelegated(chainId, delegator)
  const { t } = useTranslation()

  const sendTransaction = useSendTransaction(chainId, usersAddress)

  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  const submitUpdateTransaction = async () => {
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const ticketContract = getTicketContract(chainId)
    const fnCalls: string[] = []
    let totalAmountToFund = BigNumber.from(0)

    // Add creations to the list of transactions
    for (const delegationCreation of delegationCreations) {
      const { slot, delegatee, lockDuration } = delegationCreation
      const populatedTx = await twabDelegatorContract.populateTransaction.createDelegation(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add updates to the list of transactions
    for (const delegationUpdate of delegationUpdates) {
      const { slot, delegatee, lockDuration } = delegationUpdate
      const populatedTx = await twabDelegatorContract.populateTransaction.updateDelegatee(
        delegator,
        slot,
        delegatee,
        lockDuration
      )
      fnCalls.push(populatedTx.data)
    }

    // Add withdrawals to the list of transactions
    for (const delegationWithdrawal of delegationWithdrawals) {
      const { slot, amount } = delegationWithdrawal
      const delegation = getDelegation(delegationWithdrawal)
      const amountToWithdraw = delegation.delegation.balance.sub(amount)
      const populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
        slot,
        amountToWithdraw,
        delegator
      )
      fnCalls.push(populatedTx.data)
    }

    // Add funds to the list of transactions
    for (const delegationFund of delegationFunds) {
      const { slot, amount } = delegationFund
      const delegation = getDelegation(delegationFund)
      let amountToFund: BigNumber

      // If there's an existing delegation, amountToFund is the difference
      if (!!delegation) {
        amountToFund = amount.sub(delegation.delegation.balance)
      } else {
        amountToFund = amount
      }

      let populatedTx: PopulatedTransaction
      if (amountToFund.isNegative()) {
        const amountToWithdraw = amountToFund.mul(-1)
        populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
          slot,
          amountToWithdraw,
          delegator
        )
      } else {
        totalAmountToFund = totalAmountToFund.add(amountToFund)
        populatedTx = await twabDelegatorContract.populateTransaction.fundDelegation(
          delegator,
          slot,
          amountToFund
        )
      }
      fnCalls.push(populatedTx.data)
    }

    let callTransaction: () => Promise<TransactionResponse>

    // Ensure allowance is high enough. Get signature for permitAndMulticall.
    if (!totalAmountToFund.isZero() && allowance.lt(totalAmountToFund)) {
      setSignaturePending(true)

      const amountToIncrease = totalAmountToFund.sub(allowance)
      const domain = {
        name: 'PoolTogether ControlledToken',
        version: '1',
        chainId,
        verifyingContract: ticketContract.address
      }

      // NOTE: Nonce must be passed manually for signERC2612Permit to work with WalletConnect
      const deadline = (await signer.provider.getBlock('latest')).timestamp + 5 * 60
      const response = await ticketContract.functions.nonces(usersAddress)
      const nonce: BigNumber = response[0]

      const signaturePromise = signERC2612Permit(
        signer,
        domain,
        usersAddress,
        twabDelegatorContract.address,
        amountToIncrease.toString(),
        deadline,
        nonce.toNumber()
      )

      toast.promise(signaturePromise, {
        pending: t('signatureIsPending'),
        error: t('signatureRejected')
      })

      try {
        const signature = await signaturePromise

        // Overwrite v for hardware wallet signatures
        // https://ethereum.stackexchange.com/questions/103307/cannot-verifiy-a-signature-produced-by-ledger-in-solidity-using-ecrecover
        const v = signature.v < 27 ? signature.v + 27 : signature.v

        callTransaction = async () =>
          twabDelegatorContract.permitAndMulticall(
            amountToIncrease,
            {
              deadline: signature.deadline,
              v,
              r: signature.r,
              s: signature.s
            },
            fnCalls
          )
      } catch (e) {
        setSignaturePending(false)
        console.error(e)
        return
      }
    } else {
      callTransaction = async () => twabDelegatorContract.multicall(fnCalls)
    }

    const transactionId = sendTransaction(t('updateDelegations'), callTransaction, {
      onSent: () => {
        setSignaturePending(false)
      },
      onConfirmed: () => {
        setModalState(CreatePromotionModalState.RECEIPT)
      },
      onSuccess: async () => {
        await refetch()
        resetAtoms()
        setIsOpen(false)
        refetchDelegationBalance()
        refetchTicketBalance()
        setModalState(CreatePromotionModalState.REVIEW)
      }
    })
    setTransactionId(transactionId)
  }

  return (
    <TransactionButton
      className='w-full'
      onClick={submitUpdateTransaction}
      disabled={!signer || !isAllowanceFetched || transactionPending || !isBalanceSufficient}
      pending={transactionPending}
      chainId={chainId}
      toolTipId={'confirm-delegation-updates'}
    >
      {t('confirmUpdates')}
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
      <p className='text-xs'>{t('delegationConfirmationDescription')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
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
