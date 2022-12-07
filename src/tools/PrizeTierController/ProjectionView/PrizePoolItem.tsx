import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTvl } from '@prizeTierController/hooks/usePrizePoolTvl'
import { PrizePoolEditHistory, PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { useTranslation } from 'next-i18next'

export const PrizePoolItem = (props: {
  prizePool: PrizePool
  editHistory?: PrizePoolEditHistory
}) => {
  const { prizePool, editHistory } = props

  if (editHistory && editHistory.newConfig && editHistory.prizeTierHistoryContract.isV2) {
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
  const { t } = useTranslation()

  // TODO: show prizes over time chart
  // TODO: display daily, weekly, monthly, and yearly estimate of prize amounts
  // TODO: show dropped prizes estimates
  // TODO: include variance slider

  return (
    <>
      {isFetchedTvl ? (
        <PoolTVL tvl={tvl} token={editHistory.prizeTierHistoryContract.token} />
      ) : (
        t('loading')
      )}
    </>
  )
}

const PoolTVL = (props: { tvl: number; token: Token }) => {
  const { tvl } = props

  return (
    // TODO: proper styling
    // TODO: localization
    <span>TVL: {tvl}</span>
  )
}

const DrawChances = (props: { tvl: number; prizeTierConfig: PrizeTierConfigV2 }) => {
  const { tvl, prizeTierConfig } = props

  // TODO: get estimated chances for each tier based on dpr
  // TODO: display estimated prize counts with DPR
  // TODO: display estimated prize values with DPR

  return <></>
}
