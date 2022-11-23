import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const isEditPrizeTiersModalOpenAtom = atom(false)
export const isSavePrizeTiersModalOpenAtom = atom(false)

export const selectedPrizePoolIdAtom = atom<string>('')
export const selectedPrizeTierHistoryAddressAtom = atom<string>('')
export const selectedPrizeTierHistoryChainIdAtom = atom<number>(-1)

export const prizeTierEditsAtom = atomWithReset<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: Partial<PrizeTierConfig> }
}>({})
export const allCombinedPrizeTiersAtom = atom<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
}>({})
