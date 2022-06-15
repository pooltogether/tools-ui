import { usePrizePoolNetwork } from '@hooks/usePrizePoolNetwork'

export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizePools
}
