import { TIER_DECIMALS } from '@prizeTierController/config'
import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'

export const formatCombinedPrizeTier = (
  prizeTier: PrizeTierConfigV2,
  prizeTierEdits: Partial<PrizeTierConfigV2>
): PrizeTierConfigV2 => {
  const combinedPrizeTier = { ...prizeTier }
  for (const key in prizeTierEdits) {
    if (key === 'tiers') {
      let tempTiers: number[] = Array(16).fill(0)
      prizeTierEdits.tiers.forEach((tier, i) => {
        tempTiers[i] = tier
      })
      combinedPrizeTier.tiers = tempTiers
    } else {
      if (
        prizeTierEdits[key] !== undefined &&
        prizeTierEdits[key] !== null &&
        !!prizeTierEdits[key]
      ) {
        combinedPrizeTier[key] = prizeTierEdits[key]
      }
    }
  }

  // Checking tiers for decimal issues:
  const tiersSum = combinedPrizeTier.tiers.reduce((a, b) => a + b, 0)
  if (tiersSum !== 10 ** TIER_DECIMALS) {
    const firstNonEmptyTier = combinedPrizeTier.tiers.findIndex((value) => value > 0)
    if (firstNonEmptyTier !== -1) {
      combinedPrizeTier.tiers[firstNonEmptyTier] += 10 ** TIER_DECIMALS - tiersSum
    }
  }

  return combinedPrizeTier
}
