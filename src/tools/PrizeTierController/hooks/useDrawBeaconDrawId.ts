import { usePrizePoolNetwork } from '@hooks/usePrizePoolNetwork'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const useDrawBeaconDrawId = (prizePool: PrizePool) => {
  const prizePoolNetwork = usePrizePoolNetwork()

  return useQuery(['useDrawBeaconDrawId', prizePool?.id()], async () => {
    const drawBeaconPeriod = await prizePoolNetwork.getDrawBeaconPeriod()
    const drawId = drawBeaconPeriod?.drawId

    return drawId
  })
}
