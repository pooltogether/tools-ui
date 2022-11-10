import { PrizeTierConfig } from '@pooltogether/v4-utils-js'

export const getCombinedPrizeTier = (
  prizeTier: PrizeTierConfig,
  prizeTierEdits: Partial<PrizeTierConfig>
) => {
  const combinedPrizeTier = { ...prizeTier }
  for (const key in prizeTierEdits) {
    if (
      prizeTierEdits[key] !== undefined &&
      prizeTierEdits[key] !== null &&
      !!prizeTierEdits[key]
    ) {
      combinedPrizeTier[key] = prizeTierEdits[key]
    }
  }
  return combinedPrizeTier
}
