import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { atom, useAtom } from 'jotai'
import { atomWithStorage, useUpdateAtom } from 'jotai/utils'
import { toast } from 'react-toastify'
import { v4 as uuid } from 'uuid'
import { sentryLog } from '../services/sentry'

export interface Transaction {
  id: string
  transactionName: string
  chainId: number
  usersAddress: string
  status: TransactionStatus
  state: TransactionState
  response?: TransactionResponse
  receipt?: TransactionReceipt
  callbacks?: TransactionCallbacks
}

/**
 * A transaction is pending until it has either been cancelled, errored or succeeded.
 */
export enum TransactionState {
  pending = 'pending',
  complete = 'complete'
}

/**
 * A transaction progresses through these states linearly.
 * 1. pendingUserConfirmation
 * 2. pendingBlockchainConfirmation or cancelled
 * 3. success or error
 */
export enum TransactionStatus {
  pendingUserConfirmation = 'userConfirming',
  pendingBlockchainConfirmation = 'chainConfirming',
  cancelled = 'cancelled',
  success = 'success',
  error = 'error'
}

export interface TransactionCallbacks {
  // TODO: refetch timeouts
  refetch?: (id: string) => void
  onConfirmed?: (id: string) => void
  onSuccess?: (id: string) => void
  onSent?: (id: string) => void
  onCancelled?: (id: string) => void
  onComplete?: (id: string) => void
  onError?: (id: string) => void
}

/**
 * Transaction we can do something with
 */
export const transactionsAtom = atomWithStorage<Transaction[]>('pooltogether-transactions', [])

/**
 * Write only.
 * Creates a transaction in the storage.
 */
export const createTransactionsAtom = atom<
  null,
  { id: string; transactionName: string; chainId: number; usersAddress: string }
>(null, (get, set, _transaction) => {
  const transactions = [...get(transactionsAtom)]
  const transaction: Transaction = {
    ..._transaction,
    state: TransactionState.pending,
    status: TransactionStatus.pendingUserConfirmation
  }
  transactions.push(transaction)
  set(transactionsAtom, transactions)
})

/**
 * Write only.
 * Updates a transactions state, status, response or receipt in the storage.
 */
export const updateTransactionsAtom = atom<
  null,
  {
    id: string
    state?: TransactionState
    status?: TransactionStatus
    response?: TransactionResponse
    receipt?: TransactionReceipt
  }
>(null, (get, set, transactionUpdate) => {
  const { id, state, status, response, receipt } = transactionUpdate
  const transactions = [...get(transactionsAtom)]
  const index = transactions.findIndex((transaction) => transaction.id === id)
  transactions[index] = {
    ...transactions[index],
    state: state || transactions[index].state,
    status: status || transactions[index].status,
    response: response || transactions[index].response,
    receipt: receipt || transactions[index].receipt
  }
  set(transactionsAtom, transactions)
})

/**
 * @param chainId
 * @param usersAddress
 * @returns
 */
export const useSendTransaction = (chainId: number, usersAddress: string) => {
  const createTransaction = useUpdateAtom(createTransactionsAtom)
  const updateTransaction = useUpdateAtom(updateTransactionsAtom)

  /**
   * Submits the transaction, updates state and executes callbacks.
   * @param id
   * @param transactionName
   * @param chainId
   * @param usersAddress
   * @param callTransaction
   * @param callbacks
   */
  const sendTransaction = async (
    id: string,
    transactionName: string,
    chainId: number,
    callTransaction: () => Promise<TransactionResponse>,
    callbacks?: TransactionCallbacks
  ) => {
    let response: TransactionResponse
    let receipt: TransactionReceipt

    try {
      callbacks?.onSent?.(id)
      const responsePromise = callTransaction()
      toast.promise(responsePromise, {
        pending: `${transactionName} confirmation is pending`
      })
      response = await responsePromise
      // Chain id may be set to 0 if EIP-155 is disabled and legacy signing is used
      // See https://docs.ethers.io/v5/api/utils/transactions/#Transaction
      if (response.chainId === 0) {
        response.chainId = chainId
      }
      // Transaction was confirmed in users wallet
      updateTransaction({ id, response, status: TransactionStatus.pendingBlockchainConfirmation })
      callbacks?.onConfirmed?.(id)

      const receiptPromise = response.wait()
      toast.promise(receiptPromise, {
        // TODO: We could make pending & succeded toasts include the tx hash & a link to etherscan.
        pending: `${transactionName} is pending`,
        success: `${transactionName} has completed`,
        error: `${transactionName} was rejected`
      })
      receipt = await receiptPromise

      console.log({ receipt, response })

      // Transaction was confirmed on chain
      callbacks?.onComplete?.(id)
      const status =
        !!receipt.status && receipt.status === 1
          ? TransactionStatus.success
          : TransactionStatus.error
      updateTransaction({ id, receipt, status, state: TransactionState.complete })
      if (status === TransactionStatus.success) {
        callbacks?.onSuccess?.(id)
      } else {
        callbacks?.onError?.(id)
      }

      callbacks?.refetch?.(id)
    } catch (e) {
      console.error(e.message)
      console.log({ e, receipt, response })
      if (e?.message?.match('User denied transaction signature')) {
        updateTransaction({
          id,
          status: TransactionStatus.cancelled,
          state: TransactionState.complete
        })
        toast.error(`${transactionName} confirmation was cancelled`)
      } else if (e?.error?.message) {
        const errorDetails = getErrorDetails(e.error.message)

        updateTransaction({
          id,
          receipt,
          status: TransactionStatus.error,
          state: TransactionState.complete
        })
        const errorMessage = `Transaction failed - ${errorDetails}`
        toast.error(errorMessage)
        sentryLog(errorMessage)
      } else {
        updateTransaction({
          id,
          receipt,
          status: TransactionStatus.error,
          state: TransactionState.complete
        })
        const errorMessage = `Transaction failed - Unknown error`
        toast.error(errorMessage)
        sentryLog(errorMessage)
      }
    }
  }

  return (
    transactionName: string,
    callTransaction: () => Promise<TransactionResponse>,
    callbacks?: TransactionCallbacks
  ) => {
    const id: string = uuid()
    createTransaction({ id, transactionName, chainId, usersAddress })
    sendTransaction(id, transactionName, chainId, callTransaction, callbacks)
    return id
  }
}

/**
 *
 * @param id
 * @returns
 */
export const useTransaction = (id: string) => {
  const [transactions] = useAtom(transactionsAtom)
  return transactions.find((transaction) => transaction.id === id)
}

/**
 *
 * @param usersAddress
 * @returns
 */
export const useUsersTransactions = (usersAddress: string) => {
  const [transactions] = useAtom(transactionsAtom)
  return transactions.filter((transaction) => transaction.usersAddress === usersAddress)
}

const getErrorDetails = (errorMessage: string) => {
  if (errorMessage.includes('Ticket/twab-burn-lt-balance')) return 'Insufficient ticket balance'
  if (errorMessage.includes('TWABDelegator/lock-too-long')) return 'Lock is too long'
  return errorMessage
}
