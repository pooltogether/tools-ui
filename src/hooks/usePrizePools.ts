import { usePrizePoolNetwork } from '@hooks/v4/usePrizePoolNetwork'

export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizePools
}
