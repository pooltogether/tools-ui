import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizePoolEditHistory } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'

export const PrizePoolItem = (props: {
  prizePool: PrizePool
  editHistory?: PrizePoolEditHistory
}) => {
  const { prizePool, editHistory } = props

  if (editHistory) {
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

  return <></>
}
