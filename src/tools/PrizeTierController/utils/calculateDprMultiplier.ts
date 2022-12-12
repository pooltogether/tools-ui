import { DPR_DECIMALS } from '@prizeTierController/config'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export const calculateDprMultiplier = (
  dpr: number,
  tvl: number,
  totalPrize: BigNumber,
  decimals: string
) => {
  const totalPrizesPerDraw = parseFloat(formatUnits(totalPrize, parseInt(decimals)))
  const formattedDpr = dpr / 10 ** DPR_DECIMALS
  const multiplier = (formattedDpr * tvl) / totalPrizesPerDraw
  return multiplier
}
