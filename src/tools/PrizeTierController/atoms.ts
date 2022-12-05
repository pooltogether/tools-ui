import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const isPrizeTierListCollapsed = atom(true)

export const isEditPrizeTiersModalOpenAtom = atom(false)
export const isSavePrizeTiersModalOpenAtom = atom(false)

export const selectedPrizeTierHistoryContractIdAtom = atom<string>('')

export const prizeTierEditsAtom = atomWithReset<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: Partial<PrizeTierConfig> }
}>({})
export const allCombinedPrizeTiersAtom = atom<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
}>({})
