import { PrizeTier } from '@pooltogether/v4-utils-js'

export const formatRawPrizeTierString = (prizeTier: PrizeTier) => {
  let rawString = ''
  rawString += prizeTier.bitRangeSize
  rawString += ',' + prizeTier.drawId
  rawString += ',' + prizeTier.maxPicksPerUser
  rawString += ',' + prizeTier.expiryDuration
  rawString += ',' + prizeTier.endTimestampOffset
  rawString += ',' + prizeTier.prize.toString()
  rawString += ',[' + prizeTier.tiers.toString() + ']'
  return rawString
}
