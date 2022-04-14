import { useState } from 'react'
import { BottomSheet, BottomSheetTitle } from '@pooltogether/react-components'
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

import { PromotionForm } from '@twabRewards/PromotionForm'
import { Promotion, PromotionFormValues } from '@twabRewards/interfaces'
// import { buildApproveTx } from '@twabRewards/transactions/buildApproveTx'
// import { buildCreateTx } from '@twabRewards/transactions/buildCreateTx'

enum CreatePromotionModalState {
  'FORM',
  'REVIEW'
}

export const CreatePromotionModal: React.FC<{
  chainId: number
  currentAccount: string
}> = (props) => {
  const { chainId, currentAccount } = props

  const [isOpen, setIsOpen] = useAtom(createPromotionModalOpenAtom)
  const [params, setParams] = useState(undefined)
  console.log({ params })

  const { t } = useTranslation()
  const [modalState, setModalState] = useState(CreatePromotionModalState.FORM)

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
        <BottomSheetTitle chainId={chainId} title={t('delegationConfirmation')} />
        {/* <TicketBalanceWarning chainId={chainId} isBalanceSufficient={isBalanceSufficient} />
        <DelegationLockWarning />
        <div>
          <p className='text-xs font-bold mb-1 capitalize'>{t('reviewChanges')}</p>
          <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        </div>
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          transactionPending={transactionPending}
          isBalanceSufficient={isBalanceSufficient}
          setIsOpen={setIsOpen}
          setTransactionId={setTransactionId}
          setModalState={setModalState}
          setListState={setListState}
          setSignaturePending={setSignaturePending}
        /> */}
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

export interface CreatePromotionReviewViewProps {
  chainId: number
  params: Promotion
  approveTx: Transaction
  createTx: Transaction
  refetch: () => void
  onDismiss: () => void
}

const CreatePromotionReviewView = (props: CreatePromotionReviewViewProps) => {
  const { chainId, params, approveTx, createTx, refetch, onDismiss } = props

  const twabDelegator = getTwabDelegatorContractAddress(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )

  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const sendTransaction = useSendTransaction(chainId, usersAddress)
  // const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)
  const signer = useWalletSigner()

  const submitCreatePromotionTransaction = async () => {
    const twabRewardsContract = getTwabRewardsContract(chainId, signer)
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
        setModalState(ConfirmModalState.receipt)
      },
      onSuccess: async () => {
        await refetch()
        resetAtoms()
        setListState(ListState.readOnly)
        setIsOpen(false)
        refetchDelegationBalance()
        refetchTicketBalance()
        setModalState(ConfirmModalState.review)
      }
    })
    setTransactionId(transactionId)
  }

  // const sendApproveTx = async () => {
  //   const callTransaction = buildApproveTx(
  //     provider,
  //     MaxUint256,
  //     prizePool.addresses.prizePool,
  //     token
  //   )

  //   const name = t(`allowTickerPool`, { ticker: token.symbol })
  //   const txId = await sendTx({
  //     name,
  //     method: 'approve',
  //     callTransaction,
  //     callbacks: {
  //       refetch
  //     }
  //   })
  //   setApproveTxId(txId)
  // }

  if (!isWalletOnProperNetwork) {
    return (
      <>
        <ModalTitle chainId={prizePool.chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
      </>
    )
  }

  if (!depositAllowanceUnformatted) {
    return (
      <>
        <ModalTitle chainId={chainId} title={t('loadingYourData', 'Loading your data')} />
        <ModalLoadingGate className='mt-8' />
      </>
    )
  }

  if (amountToDeposit && depositAllowanceUnformatted?.lt(amountToDeposit.amountUnformatted)) {
    return (
      <>
        <ModalTitle chainId={chainId} title={t('approveDeposits', 'Approve deposits')} />
        <ModalApproveGate
          amountToDeposit={amountToDeposit}
          chainId={chainId}
          approveTx={approveTx}
          sendApproveTx={sendApproveTx}
          className='mt-8'
        />
      </>
    )
  }

  if (createTx && createTx.sent) {
    if (createTx.error) {
      return (
        <>
          <ModalTitle chainId={chainId} title={t('errorDepositing', 'Error depositing')} />
          <p className='my-2 text-accent-1 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
          <p className='mb-8 text-accent-1 text-center mx-8'>
            {t(
              'somethingWentWrongWhileProcessingYourTransaction',
              'Something went wrong while processing your transaction.'
            )}
          </p>
          <SquareButton
            theme={SquareButtonTheme.tealOutline}
            className='w-full'
            onClick={onDismiss}
          >
            {t('tryAgain', 'Try again')}
          </SquareButton>
        </>
      )
    }

    return (
      <>
        <ModalTitle chainId={chainId} title={t('depositSubmitted', 'Deposit submitted')} />
        <TransactionReceiptButton className='mt-8 w-full' chainId={chainId} tx={createTx} />
        <AccountPageButton />
      </>
    )
  }

  return (
    <>
      <ModalTitle chainId={chainId} title={t('depositConfirmation')} />
      <div className='w-full mx-auto mt-8 space-y-8'>
        <AmountBeingSwapped
          title={t('depositTicker', { ticker: token.symbol })}
          chainId={chainId}
          from={token}
          to={ticket}
          amountFrom={amountToDeposit}
          amountTo={amountToDeposit}
        />

        <TxButtonNetworkGated
          className='mt-8 w-full'
          chainId={chainId}
          toolTipId={`deposit-tx-${chainId}`}
          onClick={sendcreateTx}
          disabled={createTx?.inWallet && !createTx.cancelled && !createTx.completed}
        >
          {t('confirmDeposit', 'Confirm deposit')}
        </TxButtonNetworkGated>
      </div>
    </>
  )
}
