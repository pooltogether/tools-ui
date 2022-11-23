import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { PrizeTierEditsCheck } from '@prizeTierController/interfaces'
import { PrizePoolTitle } from '@prizeTierController/PrizeTierHistoryList'

export const PrizePoolTransactionDisplay = (props: {
  prizePool: PrizePool
  newConfig: PrizeTierConfig
  edits: PrizeTierEditsCheck
  drawId: number
}) => {
  const { prizePool, newConfig, edits, drawId } = props

  // TODO: Show all TXs to be executed (push)
  // TODO: allow user to copy current config onto clipboard for manual txs or sharing
  // TODO: modal should only allow transactions from wallets that are the owner or manager of a given pool
  // TODO: Show context for every TX being executed -> ready, ongoing, completed w/ block explorer link, failed, etc
  // TODO: Use `TXButton` or `TransactionButton`?
  // TODO: Use `useSendTransaction` to actually send tx data

  if (edits.edited) {
    return (
      <li>
        <PrizePoolTitle prizePool={prizePool} className='mb-4' />
        <div>{/* TODO */}</div>
      </li>
    )
  }
}
