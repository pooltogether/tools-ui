import { toast } from 'react-toastify'
import { signERC2612Permit } from 'eth-permit'
import {
  SendTransactionOptions,
  useIsWalletOnChainId,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { delegationChainIdAtom, delegatorAtom } from '@twabDelegator/atoms'
import { DelegationFund, DelegationId, DelegationUpdate } from '@twabDelegator/interfaces'
import { useQuery } from 'react-query'
import { useIsUserDelegatorsRepresentative } from './useIsUserDelegatorsRepresentative'
import { useAtom } from 'jotai'
import { useSigner } from 'wagmi'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { getV4TicketContract } from '@utils/getV4TicketContract'
import { BigNumber, PopulatedTransaction } from 'ethers'
import { useLatestBlock } from '@hooks/useLatestBlock'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'
import { useTokenAllowance } from '@pooltogether/hooks'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useTranslation } from 'react-i18next'
import { chunkArray } from '@utils/chunkArray'
import { useDelegatorsStake } from './useDelegatorsStake'
import { useIsDelegatorsBalanceSufficient } from './useIsDelegatorsBalanceSufficient'
import { useIsDelegatorsStakeSufficient } from './useIsDelegatorsStakeSufficient'

/**
 *
 * @param delegationUpdates
 * @param delegationCreations
 * @param delegationFunds
 * @param setSignaturePending
 * @param setChunkingPending
 * @returns
 */
export const useBulkSendTransactionOptions = (
  csvUpdates: {
    delegationUpdates: DelegationUpdate[]
    delegationCreations: DelegationUpdate[]
    delegationFunds: DelegationFund[]
  },
  setSignaturePending: (isPending: boolean) => void,
  setChunkingPending: (isPending: boolean) => void,
  pushTransactionId: (id: string) => void,
  resetTransactionIds: () => void
) => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const [chainId] = useAtom(delegationChainIdAtom)
  const [delegator] = useAtom(delegatorAtom)
  const { data: signer, isFetched: isSignerFetched } = useSigner()
  const { data: isUserARepresentative } = useIsUserDelegatorsRepresentative(
    chainId,
    usersAddress,
    delegator
  )
  const { data: block, isFetched: isBlockFetched } = useLatestBlock(chainId)
  const { data: delegations, isFetched: isUsersDelegationsFetched } = useDelegatorsTwabDelegations(
    chainId,
    delegator
  )
  const ticket = useV4Ticket(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: allowance } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const isWalletOnCorrectNetwork = useIsWalletOnChainId(chainId)
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(
    chainId,
    delegator,
    csvUpdates.delegationFunds
  )
  const isStakeSufficient = useIsDelegatorsStakeSufficient(
    chainId,
    delegator,
    csvUpdates.delegationFunds
  )

  // TODO: If there's no balance or staked amount if rep - don't run

  /**
   *
   * @param delegationId
   * @returns
   */
  const getDelegation = (delegationId: DelegationId) =>
    delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationId.slot) &&
        delegation.delegationId.delegator === delegationId.delegator
    )

  /**
   *
   * @param estimateGas
   * @param fnCalls
   * @returns
   */
  const getChunkedFnCalls = async (
    fnCalls: string[],
    estimateGas: (fnCalls: string[]) => Promise<BigNumber>
  ) => {
    if (fnCalls.length === 1) {
      return [fnCalls]
    }

    // Get 80% of the gas limit
    const gasLimit: BigNumber = block.gasLimit.sub(block.gasLimit.div(5))

    // Data limit is 32kb
    const dataByteLimit = 32000

    let numOfTransactions = 1
    let isValidChunks = false
    let chunkedFnCalls: string[][]
    let isError = false
    do {
      try {
        chunkedFnCalls = chunkArray<string>(fnCalls, numOfTransactions)
        console.log('Checking:', { numOfTransactions, chunkedFnCalls })

        const estimateGasPromises: Promise<BigNumber>[] = chunkedFnCalls.map((fnCalls) =>
          estimateGas(fnCalls)
        )
        const settledGasEstimates = await Promise.allSettled(estimateGasPromises)

        const isValidDataSizes = chunkedFnCalls.reduce((isValid, fnCalls) => {
          return isValid && new Blob(fnCalls).size < dataByteLimit
        }, true)

        const isValidGasSizes = settledGasEstimates.reduce((isValid, result) => {
          if (result.status === 'rejected') {
            return false
          } else {
            return gasLimit.gt(result.value)
          }
        }, true)

        if (isValidGasSizes && isValidDataSizes) {
          isValidChunks = true
        } else {
          if (numOfTransactions >= 50) {
            isError = true
          }
          numOfTransactions++
        }
      } catch (e) {
        if (numOfTransactions >= 50) {
          isError = true
        }
        numOfTransactions++
      }
    } while (!isValidChunks && !isError)

    if (isError) {
      throw new Error('Too many transactions')
    }

    console.log('Final', { numOfTransactions, chunkedFnCalls })
    return chunkedFnCalls
  }

  console.log(
    csvUpdates.delegationUpdates.length > 0,
    csvUpdates.delegationCreations.length > 0,
    csvUpdates.delegationFunds.length > 0,
    isSignerFetched,
    !!usersAddress,
    isBlockFetched,
    isUsersDelegationsFetched,
    isWalletOnCorrectNetwork
  )

  return useQuery(
    ['useBulkTransactions', chainId, usersAddress, delegator, csvUpdates],
    async () => {
      console.log(['useBulkTransactions', chainId, usersAddress, delegator, csvUpdates])

      const { delegationUpdates, delegationCreations, delegationFunds } = csvUpdates

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
          withdrawToStakeFnCalls.push(populatedTx.data)
        } else if (!amountToFund.isZero()) {
          totalAmountToFund = totalAmountToFund.add(amountToFund)
          if (isUserARepresentative) {
            populatedTx = await twabDelegatorContract.populateTransaction.fundDelegationFromStake(
              delegator,
              slot,
              amountToFund
            )
          } else {
            populatedTx = await twabDelegatorContract.populateTransaction.fundDelegation(
              delegator,
              slot,
              amountToFund
            )
          }
          depositToStakeFnCalls.push(populatedTx.data)
        }
      }
      // Add withdrawal transactions before deposits to ensure balance is sufficient
      fnCalls.push(...withdrawToStakeFnCalls, ...depositToStakeFnCalls)

      let transactionsToSend: SendTransactionOptions[] = []
      const estimateMulticallGas = (fnCalls: string[]) =>
        twabDelegatorContract.estimateGas.multicall(fnCalls)

      // If allowance is not high enough get a Permit signature for permitAndMulticall
      if (
        !isUserARepresentative &&
        !totalAmountToFund.isZero() &&
        allowance.lt(totalAmountToFund)
      ) {
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
          console.log('pre sig')
          const signature = await signaturePromise
          console.log('post sig')
          setChunkingPending(true)
          setSignaturePending(false)

          // Overwrite v for hardware wallet signatures
          // https://ethereum.stackexchange.com/questions/103307/cannot-verifiy-a-signature-produced-by-ledger-in-solidity-using-ecrecover
          const v = signature.v < 27 ? signature.v + 27 : signature.v

          const estimatePermitAndMulticallGas = (fnCalls: string[]) =>
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

          console.log('Get chunks with permit')
          const chunkedFnCalls = await getChunkedFnCalls(fnCalls, estimatePermitAndMulticallGas)

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
              )
          })

          // TODO: it worked for a rep but not for the delegator themself
          if (chunkedFnCalls.length > 1) {
            for (let i = 1; i < chunkedFnCalls.length; i++) {
              transactionsToSend.push({
                name: t('updateDelegations'),
                callTransaction: async () => twabDelegatorContract.multicall(chunkedFnCalls[i])
              })
            }
          }
        } catch (e) {
          setSignaturePending(false)
          setChunkingPending(false)
          console.error(e)
          return
        }
      } else {
        console.log('Get chunks without permit')
        const chunkedFnCalls = await getChunkedFnCalls(fnCalls, estimateMulticallGas)
        chunkedFnCalls.map((fnCalls) => {
          transactionsToSend.push({
            name: t('updateDelegations'),
            callTransaction: async () =>
              twabDelegatorContract.multicall(fnCalls, {
                // Need to explicitly set the gas limit for metamask
                gasLimit: block.gasLimit.sub(block.gasLimit.div(5))
              }),
            callbacks: {
              onSentToWallet: pushTransactionId,
              onCancelled: resetTransactionIds
            }
          })
        })
      }

      setChunkingPending(false)
      return transactionsToSend
    },
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled:
        (csvUpdates.delegationUpdates.length > 0 ||
          csvUpdates.delegationCreations.length > 0 ||
          csvUpdates.delegationFunds.length > 0) &&
        isSignerFetched &&
        !!usersAddress &&
        isBlockFetched &&
        isUsersDelegationsFetched &&
        isWalletOnCorrectNetwork &&
        ((isUserARepresentative && isStakeSufficient) || isBalanceSufficient)
    }
  )
}
