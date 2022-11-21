export interface EditPrizeTierFormValues {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  prize: string
  tiers: { value: string }[]
}

export interface PrizeTierEditsCheck {
  edited: boolean
  bitRangeSize: boolean
  expiryDuration: boolean
  maxPicksPerUser: boolean
  prize: boolean
  tiers: boolean[]
}
