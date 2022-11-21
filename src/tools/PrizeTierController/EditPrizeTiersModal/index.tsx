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
import { getFormValuesFromPrizeTier } from '@prizeTierController/utils/getFormValuesFromPrizeTier'
import { getPrizeTierFromFormValues } from '@prizeTierController/utils/getPrizeTierFromFormValues'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

export const EditPrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isEditPrizeTiersModalOpenAtom)
  // const [modalState, setModalState] = useAtom(editPrizeTierModalStateAtom)

  return (
    <BottomSheet isOpen={isOpen} closeModal={() => setIsOpen(false)}>
      {/* <Tabs
        tabs={[
          {
            id: EditPrizeTierModalState.all,
            view: <BulkEdit />,
            title: 'Bulk edit'
          },
          {
            id: EditPrizeTierModalState.singular,
            view: <SingularEdit />,
            title: 'Singular edit'
          }
        ]}
        onTabSelect={(tab) => setModalState(tab.id as EditPrizeTierModalState)}
        initialTabId={modalState}
      /> */}
      <SingularEdit />
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

const SingularEdit = () => {
  const setIsEditPrizeTierModalOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const [prizeTierEdits, setPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [prizeTierHistoryAddress] = useAtom(selectedPrizeTierHistoryAddressAtom)
  const prizePools = usePrizePools()
  const [selectedPrizePoolId] = useAtom(selectedPrizePoolIdAtom)
  const prizePool = prizePools.find((prizePool) => prizePool.id() === selectedPrizePoolId)
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)

  const onSubmit = useCallback(
    (formValues: EditPrizeTierFormValues) => {
      const newPrizeTierEdits = getPrizeTierFromFormValues(formValues, tokens?.token.decimals)
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

  const { data, isFetched: isPrizeTierFetched } = usePrizeTierHistoryData(prizePool)

  const defaultValues = useMemo(() => {
    const existingEdits =
      prizeTierEdits?.[prizePool.chainId]?.[prizePool.prizeTierHistoryMetadata.address]
    if (!!existingEdits) {
      return getFormValuesFromPrizeTier(existingEdits, tokens.token.decimals, { round: true })
    }
    return getFormValuesFromPrizeTier(data.upcomingPrizeTier, tokens.token.decimals, {
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
      <p className='mb-4'>
        Make changes to {getNetworkNiceNameByChainId(prizePool.chainId)}'s Prize Tiers:
      </p>
      {!!selectedPrizePoolId && isTokensFetched && isPrizeTierFetched && (
        <EditPrizeTierHistoryForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          decimals={parseInt(tokens.token.decimals)}
        />
      )}
    </div>
  )
}
