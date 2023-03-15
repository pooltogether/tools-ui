import { PrizeTierV2 } from '@prizeTierController/interfaces'

export const formatRawPrizeTierString = (prizeTier: PrizeTierV2) => {
  let rawString = ''
  rawString += prizeTier.bitRangeSize
  rawString += ',' + prizeTier.drawId
  rawString += ',' + prizeTier.maxPicksPerUser
  rawString += ',' + prizeTier.expiryDuration
  rawString += ',' + prizeTier.endTimestampOffset
  if (!!prizeTier.dpr) {
    rawString += ',' + prizeTier.dpr
  }
  rawString += ',' + prizeTier.prize.toString()
  rawString += ',[' + prizeTier.tiers.toString() + ']'
  return `[${rawString}]`
}
