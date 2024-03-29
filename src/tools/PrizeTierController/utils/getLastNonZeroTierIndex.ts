export const getLastNonZeroTierIndex = (tiers: string[]): number => {
  let lastNonZeroIndex: number = 0
  tiers.forEach((tier, i) => {
    if (tier !== '0') {
      lastNonZeroIndex = i
    }
  })
  return lastNonZeroIndex
}
