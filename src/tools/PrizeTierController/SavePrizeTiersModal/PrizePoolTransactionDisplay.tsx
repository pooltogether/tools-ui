import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizeTierConfig, PrizeTier } from '@pooltogether/v4-utils-js'
import {
  useUsersAddress,
  useSendTransaction,
  useTransaction,
  TransactionState
} from '@pooltogether/wallet-connection'
import { usePrizeTierHistoryManager } from '@prizeTierController/hooks/usePrizeTierHistoryManager'
import { usePrizeTierHistoryOwner } from '@prizeTierController/hooks/usePrizeTierHistoryOwner'
import { PrizeTierEditsCheck } from '@prizeTierController/interfaces'
import { PrizePoolTitle } from '@prizeTierController/PrizeTierHistoryList'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useSigner } from 'wagmi'
import prizeTierHistoryABI from '@prizeTierController/abis/PrizeTierHistory'

export const PrizePoolTransactionDisplay = (props: {
  prizePool: PrizePool
  newConfig: PrizeTierConfig
  edits: PrizeTierEditsCheck
  drawId: number
}) => {
  const { prizePool, newConfig, edits, drawId } = props
  const { data: ownerData, isFetched: isOwnerFetched } = usePrizeTierHistoryOwner(prizePool)
  const { data: managerData, isFetched: isManagerFetched } = usePrizeTierHistoryManager(prizePool)

  const usersAddress = useUsersAddress()
  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const [transactionId, setTransactionId] = useState<string>('')
  const transaction = useTransaction(transactionId)

  const submitPushTransaction = () => {
    const prizeTierHistoryContract = new ethers.Contract(
      prizePool.prizeTierHistoryMetadata.address,
      prizeTierHistoryABI,
      signer
    )
    const prizeTier: PrizeTier = { ...newConfig, drawId }
    setTransactionId(
      sendTransaction({
        name: 'Push Prize Tier Config',
        callTransaction: () => prizeTierHistoryContract.push(prizeTier)
      })
    )
  }

  const txButtonDisabled =
    !isOwnerFetched ||
    !isManagerFetched ||
    (usersAddress !== ownerData.owner && usersAddress !== managerData.manager)

  // TODO: show block explorer link under txbutton when appropriate
  // TODO: allow user to copy current config as json onto clipboard

  if (edits.edited) {
    return (
      <li>
        <PrizePoolTitle prizePool={prizePool} className='mb-4' />
        <div>
          {(!transaction || transaction.state === TransactionState.pending) && (
            <TxButton
              disabled={txButtonDisabled}
              chainId={prizePool.chainId}
              onClick={submitPushTransaction}
              state={transaction?.state}
              status={transaction?.status}
            >
              Push Edits
            </TxButton>
          )}
          {!!transaction?.response?.hash && (
            <TransactionReceiptButton transaction={transaction} chainId={prizePool.chainId} />
          )}
          {transaction?.state === TransactionState.complete && 'Done!'}
        </div>
      </li>
    )
  }
}
