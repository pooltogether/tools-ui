import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { BottomSheet } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  selectedPrizePoolIdAtom,
  selectedPrizeTierHistoryAddressAtom
} from '@prizeTierController/atoms'
import { EditPrizeTierHistoryForm } from '@prizeTierController/EditPrizeTiersModal/EditPrizeTierHistoryForm'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { formatFormValuesFromPrizeTier } from '@prizeTierController/utils/formatFormValuesFromPrizeTier'
import { formatPrizeTierFromFormValues } from '@prizeTierController/utils/formatPrizeTierFromFormValues'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'

// enum EditPrizeTierModalState {
//   'all' = 'all',
//   'simple' = 'simple'
// }

export const EditPrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isEditPrizeTiersModalOpenAtom)
  // const [modalState, setModalState] = useState<EditPrizeTierModalState>(
  //   EditPrizeTierModalState.simple
  // )

  return (
    <BottomSheet isOpen={isOpen} closeModal={() => setIsOpen(false)}>
      {/* <Tabs
        tabs={[
          {
            id: EditPrizeTierModalState.all,
            view: <BulkEdit />,
            title: 'Bulk Edit'
          },
          {
            id: EditPrizeTierModalState.simple,
            view: <SimpleEdit />,
            title: 'Simple Edit'
          }
        ]}
        onTabSelect={(tab) => setModalState(tab.id as EditPrizeTierModalState)}
        initialTabId={modalState}
      /> */}
      <SimpleEdit />
    </BottomSheet>
  )
}

// const BulkEdit = () => {
//   const setIsEditPrizeTierModalOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
//   const setPrizeTierEdits = useUpdateAtom(prizeTierEditsAtom)
//   const prizePools = usePrizePools()
//   const { data: tokens } = usePrizePoolTokens(prizePools[0])
//   const decimals = tokens?.token.decimals

//   // Update all Prize Tier Histories with the edited values
//   const onSubmit = useCallback(
//     (formValues: EditPrizeTierFormValues) => {
//       const newPrizeTierEdits = getPrizeTierFromFormValues(formValues, decimals)

//       setPrizeTierEdits((prizeTierEdits) => {
//         const updatedPrizeTierEdits = { ...prizeTierEdits }
//         prizePools.map((prizePool) => {
//           if (!updatedPrizeTierEdits[prizePool.chainId]) {
//             updatedPrizeTierEdits[prizePool.chainId] = {}
//           }
//           updatedPrizeTierEdits[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address] = {
//             ...updatedPrizeTierEdits[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address],
//             ...newPrizeTierEdits
//           }
//         })
//         return updatedPrizeTierEdits
//       })
//       setIsEditPrizeTierModalOpen(false)
//     },
//     [decimals, setPrizeTierEdits, setIsEditPrizeTierModalOpen, prizePools]
//   )

//   return (
//     <div>
//       <p>Make changes across all Prize Tier History configurations at once.</p>
//       <EditPrizeTierHistoryForm onSubmit={onSubmit} />
//     </div>
//   )
// }

const SimpleEdit = () => {
  const setIsEditPrizeTierModalOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const [prizeTierEdits, setPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [prizeTierHistoryAddress] = useAtom(selectedPrizeTierHistoryAddressAtom)
  const prizePools = usePrizePools()
  const [selectedPrizePoolId] = useAtom(selectedPrizePoolIdAtom)
  const prizePool = prizePools.find((prizePool) => prizePool.id() === selectedPrizePoolId)
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)
  const { data, isFetched: isPrizeTierFetched } = usePrizeTierHistoryData(prizePool)
  const [isAdvancedDisplay, setAdvancedDisplay] = useState(false)

  const onSubmit = useCallback(
    (formValues: EditPrizeTierFormValues) => {
      const newPrizeTierEdits = formatPrizeTierFromFormValues(formValues, tokens?.token.decimals)
      setPrizeTierEdits((prizeTierEdits) => {
        // TODO: should check if edits actually make it different from existing data
        const updatedPrizeTierEdits = { ...prizeTierEdits }
        if (!updatedPrizeTierEdits[prizePool.chainId]) {
          updatedPrizeTierEdits[prizePool.chainId] = {}
        }
        updatedPrizeTierEdits[prizePool.chainId][prizeTierHistoryAddress] = {
          ...updatedPrizeTierEdits[prizePool.chainId][prizeTierHistoryAddress],
          ...newPrizeTierEdits
        }
        return updatedPrizeTierEdits
      })
      setIsEditPrizeTierModalOpen(false)
    },
    [
      prizePool.chainId,
      prizeTierHistoryAddress,
      setIsEditPrizeTierModalOpen,
      setPrizeTierEdits,
      tokens?.token.decimals
    ]
  )

  const defaultValues = useMemo(() => {
    const existingEdits =
      prizeTierEdits?.[prizePool.chainId]?.[prizePool.prizeTierHistoryMetadata.address]
    if (!!existingEdits) {
      return formatFormValuesFromPrizeTier(existingEdits, tokens.token.decimals, { round: true })
    }
    return formatFormValuesFromPrizeTier(data.upcomingPrizeTier, tokens.token.decimals, {
      round: true
    })
  }, [
    data.upcomingPrizeTier,
    prizePool.chainId,
    prizePool.prizeTierHistoryMetadata.address,
    prizeTierEdits,
    tokens.token.decimals
  ])

  return (
    <div>
      <p>Make changes to {getNetworkNiceNameByChainId(prizePool.chainId)}'s Prize Tiers:</p>
      <button className='mb-4 opacity-60' onClick={() => setAdvancedDisplay(!isAdvancedDisplay)}>
        {isAdvancedDisplay ? 'Hide' : 'Show'} advanced options
      </button>
      {!!selectedPrizePoolId && isTokensFetched && isPrizeTierFetched && (
        <EditPrizeTierHistoryForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          decimals={parseInt(tokens.token.decimals)}
          displayAdvancedOptions={isAdvancedDisplay}
        />
      )}
    </div>
  )
}
