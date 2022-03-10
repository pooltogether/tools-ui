import { Banner, BannerTheme, BottomSheet, ModalTitle } from '@pooltogether/react-components'
import { signERC2612Permit } from 'eth-permit'
import FeatherIcon from 'feather-icons-react'
import {
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatedLocksCountAtom,
  delegationUpdatesAtom,
  delegationUpdatesModalOpenAtom,
  delegationWithdrawalsAtom
} from '@twabDelegator/atoms'
import { useAtom } from 'jotai'
import { DelegationConfirmationList } from './DelegationConfirmationList'
import { useState } from 'react'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useResetDelegationAtoms } from '@twabDelegator/hooks/useResetDelegationAtoms'
import { ListState } from '@twabDelegator/DelegationList'
import { DelegationId } from '@twabDelegator/interfaces'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import { useTicket } from '@hooks/v4/useTicket'
import { getTicketContract } from '@utils/getTicketContract'
import { BigNumber, PopulatedTransaction } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useSendTransaction, useTransaction } from '@atoms/transactions'
import { toast } from 'react-toastify'
import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TransactionButton } from '@components/Buttons/TransactionButton'
import { useWalletSigner } from '@hooks/wallet/useWalletSigner'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'

enum ConfirmModalState {
  review = 'REVIEW',
  receipt = 'RECEIPT'
}

/**
 *
 * @param props
 * @returns
 */
export const ConfirmUpdatesModal: React.FC<{
  chainId: number
  delegator: string
  transactionId: string
  transactionPending: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (transactionId: string) => void
  setListState: (listState: ListState) => void
}> = (props) => {
  const {
    chainId,
    delegator,
    transactionId,
    transactionPending,
    setSignaturePending,
    setListState,
    setTransactionId
  } = props
  const [modalState, setModalState] = useState(ConfirmModalState.review)
  const [isOpen, setIsOpen] = useAtom(delegationUpdatesModalOpenAtom)
  const transaction = useTransaction(transactionId)
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(chainId, delegator)

  let content
  if (modalState === ConfirmModalState.review) {
    content = (
      <div className='flex flex-col space-y-4'>
        <ModalTitle chainId={chainId} title={'Delegation confirmation'} />
        <TicketBalanceWarning isBalanceSufficient={isBalanceSufficient} />
        <DelegationLockWarning />
        <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          transactionPending={transactionPending}
          isBalanceSufficient={isBalanceSufficient}
          setTransactionId={setTransactionId}
          setModalState={setModalState}
          setListState={setListState}
          setSignaturePending={setSignaturePending}
        />
      </div>
    )
  } else {
    content = (
      <div className='flex flex-col space-y-12'>
        <ModalTitle chainId={chainId} title={'Delegation transaction submitted'} />
        <TransactionReceiptButton chainId={chainId} transaction={transaction} />
      </div>
    )
  }

  return (
    <BottomSheet
      label='delegation-edit-modal'
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false)
        if (!transactionPending) {
          setModalState(ConfirmModalState.review)
        }
      }}
    >
      {content}
    </BottomSheet>
  )
}

/**
 *
 * @returns
 */
const DelegationLockWarning: React.FC = () => {
  const [lockCount] = useAtom(delegationUpdatedLocksCountAtom)

  if (!lockCount) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-yellow' />
      <p className='text-xs'>
        By delegating you are locking up your funds for the expiry period and relinquishing your
        chances of winning to gift those chances to other wallet addresses.
      </p>
      <a className='text-pt-teal hover:opacity-70 underline'>Learn more about Chance Delegating</a>
    </Banner>
  )
}

const TicketBalanceWarning: React.FC<{ isBalanceSufficient: boolean }> = (props) => {
  const { isBalanceSufficient } = props

  if (isBalanceSufficient === null || isBalanceSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>
        Delegated amount exceeds current ticket balance. Please lower some delegation amounts or
        deposit more into PoolTogether.
      </p>
      <a className='text-pt-teal hover:opacity-70 underline'>Deposit more</a>
    </Banner>
  )
}

interface SubmitTransactionButtonProps {
  chainId: number
  delegator: string
  transactionPending: boolean
  isBalanceSufficient: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (id: string) => void
  setModalState: (modalState: ConfirmModalState) => void
  setListState: (listState: ListState) => void
}

/**
 * https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    delegator,
    transactionPending,
    isBalanceSufficient,
    setSignaturePending,
    setModalState,
    setListState,
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
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )

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
      // TODO: Is this name the same for mainnet tickets? What about when we have multiple pools on the same chain?
      const domain = {
        name: 'PoolTogether ControlledToken',
        version: '1',
        chainId,
        verifyingContract: ticketContract.address
      }
      const signaturePromise = signERC2612Permit(
        signer,
        domain,
        usersAddress,
        twabDelegatorContract.address,
        amountToIncrease.toString()
      )

      toast.promise(signaturePromise, {
        pending: 'Signature is pending',
        error: 'Signature rejected'
      })

      try {
        // TODO: Signature rejected with wallet connect provider. `_provider.send` is unavailable. Maybe try to switch to WAGMI or fiddle with web3-react connectors...
        const signature = await signaturePromise

        callTransaction = async () =>
          twabDelegatorContract.permitAndMulticall(
            usersAddress.toLowerCase(),
            amountToIncrease,
            {
              deadline: signature.deadline,
              v: signature.v,
              r: signature.r,
              s: signature.s
            },
            fnCalls
          )
      } catch (e) {
        setSignaturePending(false)
        console.log(e)
        return
      }
    } else {
      callTransaction = async () => twabDelegatorContract.multicall(fnCalls)
    }

    const transactionId = sendTransaction('Update delegations', callTransaction, {
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
      Confirm updates
    </TransactionButton>
  )
}
