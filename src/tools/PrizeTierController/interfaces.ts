export interface EditPrizeTierFormValues {
  bitRangeSize: number
  expiryDuration: number
  maxPicksPerUser: number
  prize: string // Formatted as a string: 1.2345
  tiers: number[]
}
