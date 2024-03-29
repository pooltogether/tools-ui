import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const isListCollapsed = atom(true)

export const isEditPrizeTiersModalOpenAtom = atom(false)
export const isSavePrizeTiersModalOpenAtom = atom(false)

export const selectedPrizeTierHistoryContractIdAtom = atom<string>('')

export const prizeTierEditsAtom = atomWithReset<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfigV2 }
}>({})
export const allCombinedPrizeTiersAtom = atom<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfigV2 }
}>({})

export enum SelectedView {
  configuration = 'configuration',
  projection = 'projection'
}
export const selectedView = atom(SelectedView.configuration)
