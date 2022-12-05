import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import { CopyIcon } from '@pooltogether/react-components'
import { PrizeTierConfig, PrizeTier } from '@pooltogether/v4-utils-js'
import {
  useUsersAddress,
  useSendTransaction,
  useTransaction,
  TransactionState
} from '@pooltogether/wallet-connection'
import prizeTierHistoryABI from '@prizeTierController/abis/PrizeTierHistory'
import { usePrizeTierHistoryManager } from '@prizeTierController/hooks/usePrizeTierHistoryManager'
import { usePrizeTierHistoryOwner } from '@prizeTierController/hooks/usePrizeTierHistoryOwner'
import { PrizeTierEditsCheck, PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { formatRawPrizeTierString } from '@prizeTierController/utils/formatRawPrizeTierString'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useSigner } from 'wagmi'

export const PrizePoolTransactionDisplay = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
  newConfig: PrizeTierConfig
  edits: PrizeTierEditsCheck
  drawId: number
}) => {
  const { prizeTierHistoryContract, newConfig, edits, drawId } = props
  const { data: owner, isFetched: isOwnerFetched } =
    usePrizeTierHistoryOwner(prizeTierHistoryContract)
  const { data: manager, isFetched: isManagerFetched } =
    usePrizeTierHistoryManager(prizeTierHistoryContract)

  const usersAddress = useUsersAddress()
  const { data: signer } = useSigner()
  const sendTransaction = useSendTransaction()
  const [transactionId, setTransactionId] = useState<string>('')
  const transaction = useTransaction(transactionId)

  const prizeTier: PrizeTier = { ...newConfig, drawId }
  const rawPrizeTierString = formatRawPrizeTierString(prizeTier)

  const submitPushTransaction = () => {
    const prizeTierHistoryContractWithSigner = new ethers.Contract(
      prizeTierHistoryContract.address,
      prizeTierHistoryABI,
      signer
    )
    setTransactionId(
      sendTransaction({
        name: 'Push Prize Tier Config',
        callTransaction: () => prizeTierHistoryContractWithSigner.push(prizeTier)
      })
    )
  }

  const txButtonDisabled =
    !isOwnerFetched || !isManagerFetched || (usersAddress !== owner && usersAddress !== manager)

  if (edits.edited) {
    return (
      <li className='bg-pt-purple-dark p-3 rounded-xl'>
        <PrizeTierHistoryTitle
          prizeTierHistoryContract={prizeTierHistoryContract}
          className='mb-4 pb-2 border-b'
        />
        <div className='flex gap-2 opacity-60 text-xxs mb-2'>
          Copy Raw Config
          <CopyIcon text={rawPrizeTierString} />
        </div>
        <div>
          {(!transaction ||
            transaction?.state === TransactionState.pending ||
            transaction?.response?.hash === undefined) && (
            <TxButton
              disabled={txButtonDisabled}
              chainId={prizeTierHistoryContract.chainId}
              onClick={submitPushTransaction}
              state={transaction?.state}
              status={transaction?.status}
            >
              Push Edits
            </TxButton>
          )}
          {!transaction && isOwnerFetched && isManagerFetched && txButtonDisabled && (
            <p className='mt-2 text-xxxs text-pt-red'>
              The connected wallet is not the owner or manager of this prize pool's tier history
              contract.
            </p>
          )}
          {!!transaction?.response?.hash && (
            <TransactionReceiptButton
              transaction={transaction}
              chainId={prizeTierHistoryContract.chainId}
            />
          )}
        </div>
      </li>
    )
  }
}
