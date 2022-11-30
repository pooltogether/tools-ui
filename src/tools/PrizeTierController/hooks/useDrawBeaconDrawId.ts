import { usePrizePoolNetwork } from '@hooks/usePrizePoolNetwork'
import { useQuery } from 'react-query'

export const useDrawBeaconDrawId = () => {
  const prizePoolNetwork = usePrizePoolNetwork()

  return useQuery(['useDrawBeaconDrawId', prizePoolNetwork.beaconChainId], async () => {
    const drawBeaconPeriod = await prizePoolNetwork.getDrawBeaconPeriod()
    const drawId = drawBeaconPeriod?.drawId

    return drawId
  })
}
