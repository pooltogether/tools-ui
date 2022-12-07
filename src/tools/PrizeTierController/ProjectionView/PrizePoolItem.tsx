import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTvl } from '@prizeTierController/hooks/usePrizePoolTvl'
import { PrizePoolEditHistory } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'

export const PrizePoolItem = (props: {
  prizePool: PrizePool
  editHistory?: PrizePoolEditHistory
}) => {
  const { prizePool, editHistory } = props

  if (editHistory && editHistory.prizeTierHistoryContract.isV2) {
    return (
      <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
        <PrizeTierHistoryTitle
          prizeTierHistoryContract={editHistory.prizeTierHistoryContract}
          showLink
          className='mb-4'
        />
        <PrizePoolProjections prizePool={prizePool} editHistory={editHistory} />
      </li>
    )
  }
}

const PrizePoolProjections = (props: {
  prizePool: PrizePool
  editHistory: PrizePoolEditHistory
}) => {
  const { prizePool, editHistory } = props
  const { data: tvl, isFetched: isFetchedTvl } = usePrizePoolTvl(prizePool)

  // TODO: display pool TVL
  // TODO: display estimated prize counts with DPR
  // TODO: display estimated prize values with DPR
  // TODO: show prizes over time chart
  // TODO: display daily, weekly, monthly, and yearly estimate of prize amounts
  // TODO: show dropped prizes estimates
  // TODO: include variance slider

  return <></>
}
