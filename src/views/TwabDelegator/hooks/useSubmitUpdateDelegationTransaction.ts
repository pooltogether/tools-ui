import { TransactionResponse } from '@ethersproject/providers'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { toast } from 'react-toastify'
import { signERC2612Permit } from 'eth-permit'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import {
  SendTransactionOptions,
  TransactionCallbacks,
  TransactionStatus,
  useSendTransaction,
  useSendTransactions,
  useTransactions,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import {
  delegationChainIdAtom,
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatesAtom,
  delegationWithdrawalsAtom,
  delegatorAtom
} from '@twabDelegator/atoms'
import { DelegationId } from '@twabDelegator/interfaces'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { getV4TicketContract } from '@utils/getV4TicketContract'
import { BigNumber, Contract, PopulatedTransaction, Signer } from 'ethers'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { useSigner } from 'wagmi'
import { useDelegatorsStake } from './useDelegatorsStake'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'
import { useIsUserDelegatorsRepresentative } from './useIsUserDelegatorsRepresentative'
import { useResetDelegationAtoms } from './useResetDelegationAtoms'
import { useTotalAmountDelegated } from './useTotalAmountDelegated'
import { useEffect } from 'react'
import { useLatestBlock } from '@hooks/useLatestBlock'
import { RSV } from 'eth-permit/dist/rpc'

export const useSubmitUpdateDelegationTransaction = (
  transactionIds: string[],
  setSignaturePending: (isPending: boolean) => void,
  setTransactionIds: (transactonIds: string[]) => void,
  callbacks?: {
    onAllComplete?: () => void
    onEveryConfirmedByUser?: () => void
  }
) => {
  const transactions = useTransactions(transactionIds)
  const [chainId] = useAtom(delegationChainIdAtom)
  const [delegator] = useAtom(delegatorAtom)
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)
  const { data: delegations, refetch } = useDelegatorsTwabDelegations(chainId, delegator)
  const resetAtoms = useResetDelegationAtoms()
  const usersAddress = useUsersAddress()
  const { data: isUserARepresentative, isFetched: isRepresentativeFetched } =
    useIsUserDelegatorsRepresentative(chainId, usersAddress, delegator)
  const { refetch: getSigner } = useSigner()
  const ticket = useV4Ticket(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance, isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const { refetch: refetchStake } = useDelegatorsStake(chainId, delegator)
  const { data: block } = useLatestBlock(chainId)
  const { refetch: refetchTicketBalance } = useTokenBalance(chainId, delegator, ticket.address)
  const { refetch: refetchDelegationBalance } = useTotalAmountDelegated(chainId, delegator)
  const { t } = useTranslation()
  const sendTransaction = useSendTransaction(t)
  const sendTransactions = useSendTransactions(t)

  const getChunkedFnCalls = async (
    estimateGas: (fnCalls: string[]) => Promise<BigNumber>,
    fnCalls: string[]
  ) => {
    const gasLimit: BigNumber = block.gasLimit

    let numOfTransactions = 1
    let isSufficientGas = false
    do {
      try {
        const estimatedGas = await estimateGas(
          fnCalls.slice(0, (fnCalls.length - 1) / numOfTransactions)
        )
        if (estimatedGas.lt(gasLimit)) {
          isSufficientGas = true
        } else {
          numOfTransactions++
        }
      } catch (e) {
        numOfTransactions++
      }
    } while (!isSufficientGas)

    const chunkSize = (fnCalls.length - 1) / numOfTransactions
    const chunkedFnCalls: string[][] = []
    for (let i = 0; i < fnCalls.length; i += chunkSize) {
      const chunk = fnCalls.slice(i, i + chunkSize)
      chunkedFnCalls.push(chunk)
    }
    return chunkedFnCalls
  }

  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  useEffect(() => {
    if (transactions.every((transaction) => transaction.status === TransactionStatus.success)) {
      refetch()
      resetAtoms()
      refetchDelegationBalance()
      refetchStake()
      refetchTicketBalance()
      // setIsOpen(false)
      // setModalState(ConfirmModalState.review)
      callbacks?.onAllComplete?.()
    }
  }, [transactions])

  return async () => {
    const { data: signer } = await getSigner()
    const twabDelegatorContract = getTwabDelegatorContract(chainId, signer)
    const ticketContract = getV4TicketContract(chainId)
    const fnCalls: string[] = []
    const withdrawToStakeFnCalls: string[] = []
    const depositToStakeFnCalls: string[] = []
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
      let populatedTx: PopulatedTransaction
      if (isUserARepresentative) {
        populatedTx = await twabDelegatorContract.populateTransaction.withdrawDelegationToStake(
          delegator,
          slot,
          amountToWithdraw
        )
      } else {
        populatedTx = await twabDelegatorContract.populateTransaction.transferDelegationTo(
          slot,
          amountToWithdraw,
          delegator
        )
      }
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
        withdrawToStakeFnCalls.push(populatedTx.data)
      } else {
        totalAmountToFund = totalAmountToFund.add(amountToFund)
        populatedTx = await twabDelegatorContract.populateTransaction.fundDelegation(
          delegator,
          slot,
          amountToFund
        )
        depositToStakeFnCalls.push(populatedTx.data)
      }
    }
    // Add withdrawal transactions before deposits to ensure balance is sufficient
    fnCalls.push(...withdrawToStakeFnCalls, ...depositToStakeFnCalls)

    let transactionsToSend: SendTransactionOptions[] = []

    // If allowance is not high enough get a Permit signature for permitAndMulticall
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
        setSignaturePending(false)

        // Overwrite v for hardware wallet signatures
        // https://ethereum.stackexchange.com/questions/103307/cannot-verifiy-a-signature-produced-by-ledger-in-solidity-using-ecrecover
        const v = signature.v < 27 ? signature.v + 27 : signature.v

        const estimateGas = (fnCalls: string[]) =>
          twabDelegatorContract.estimateGas.permitAndMulticall(
            amountToIncrease,
            {
              deadline: signature.deadline,
              v,
              r: signature.r,
              s: signature.s
            },
            fnCalls
          )

        const chunkedFnCalls = await getChunkedFnCalls(estimateGas, fnCalls)

        transactionsToSend.push({
          name: t('updateDelegations'),
          callTransaction: async () =>
            twabDelegatorContract.permitAndMulticall(
              amountToIncrease,
              {
                deadline: signature.deadline,
                v,
                r: signature.r,
                s: signature.s
              },
              chunkedFnCalls[0]
            ),
          callbacks: {
            onConfirmedByUser: () => {
              callbacks?.onEveryConfirmedByUser?.()
              // setModalState(ConfirmModalState.receipt)
            }
            // onSuccess: async () => {
            // await refetch()
            // resetAtoms()
            // onSuccess?.()
            // setIsOpen(false)
            // refetchDelegationBalance()
            // refetchTicketBalance()
            // setModalState(ConfirmModalState.review)
            // }
          }
        })

        if (chunkedFnCalls.length > 1) {
          for (let i = 1; i < chunkedFnCalls.length; i++) {
            transactionsToSend.push({
              name: t('updateDelegations'),
              callTransaction: async () => twabDelegatorContract.multicall(chunkedFnCalls[i]),
              callbacks: {
                onConfirmedByUser: () => {
                  callbacks?.onEveryConfirmedByUser?.()
                }
              }
            })
          }
        }
      } catch (e) {
        setSignaturePending(false)
        console.error(e)
        return
      }
    } else {
      const estimateGas = (fnCalls: string[]) =>
        twabDelegatorContract.estimateGas.multicall(fnCalls)
      const chunkedFnCalls = await getChunkedFnCalls(estimateGas, fnCalls)
      chunkedFnCalls.map((fnCalls) => {
        transactionsToSend.push({
          name: t('updateDelegations'),
          callTransaction: async () => twabDelegatorContract.multicall(fnCalls),
          callbacks: {
            onConfirmedByUser: () => {
              callbacks?.onEveryConfirmedByUser?.()
            }
          }
        })
      })
    }

    if (transactionsToSend.length > 1) {
      setTransactionIds([sendTransaction(transactionsToSend[0])])
    } else {
      setTransactionIds(sendTransactions(transactionsToSend))
    }
  }
}
