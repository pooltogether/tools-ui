export const calculateEstimatedTimeFromPrizeChance = (prizeChance: number) => {
  if (prizeChance !== 0) {
    const days = 1 / prizeChance
    const weeks = days / 7
    const months = days / (365 / 12)
    const years = days / 365
    if (days < 1.5) {
      return 'Daily'
    } else if (weeks < 1.5) {
      return `Every ${days.toFixed(0)} Days`
    } else if (months < 1.5) {
      return `Every ${weeks.toFixed(0)} Weeks`
    } else if (years < 1.5) {
      return `Every ${months.toFixed(0)} Months`
    } else {
      return `Every ${years.toFixed(0)} Years`
    }
  } else {
    return 'Never'
  }
}
