import { PrizeTier, PrizeTierV2 } from '@pooltogether/v4-utils-js'

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

export const formatRawPrizeTierStringV2 = (prizeTierV2: PrizeTierV2) => {
  let rawString = ''
  rawString += prizeTierV2.bitRangeSize
  rawString += ',' + prizeTierV2.drawId
  rawString += ',' + prizeTierV2.maxPicksPerUser
  rawString += ',' + prizeTierV2.expiryDuration
  rawString += ',' + prizeTierV2.endTimestampOffset
  rawString += ',' + prizeTierV2.dpr
  rawString += ',' + prizeTierV2.prize.toString()
  rawString += ',[' + prizeTierV2.tiers.toString() + ']'
  return rawString
}
