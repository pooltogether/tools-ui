import { PrizeTierConfig } from '@pooltogether/v4-utils-js'

export const formatCombinedPrizeTier = (
  prizeTier: PrizeTierConfig,
  prizeTierEdits: Partial<PrizeTierConfig>
) => {
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
