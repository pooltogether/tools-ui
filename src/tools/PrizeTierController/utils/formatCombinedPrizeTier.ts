import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'

// TODO: these functions should also check if tiers add up to 100% and add to the largest tier with a value if necessary

export const formatCombinedPrizeTier = (
  prizeTier: PrizeTierConfigV2,
  prizeTierEdits: Partial<PrizeTierConfigV2>
): PrizeTierConfigV2 => {
  const combinedPrizeTier = { ...prizeTier }
  for (const key in prizeTierEdits) {
    if (key === 'tiers') {
      let tempTiers = Array(16).fill(0)
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
  return combinedPrizeTier
}
