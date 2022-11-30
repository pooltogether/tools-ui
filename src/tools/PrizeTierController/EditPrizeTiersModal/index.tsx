import { BottomSheet } from '@pooltogether/react-components'
import { calculateNumberOfPrizesForTierIndex } from '@pooltogether/v4-utils-js'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  selectedPrizeTierHistoryContractIdAtom
} from '@prizeTierController/atoms'
import { EditPrizeTierHistoryForm } from '@prizeTierController/EditPrizeTiersModal/EditPrizeTierHistoryForm'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { PrizePoolTitle } from '@prizeTierController/PrizePoolTitle'
import { formatFormValuesFromPrizeTier } from '@prizeTierController/utils/formatFormValuesFromPrizeTier'
import { formatPrizeTierFromFormValues } from '@prizeTierController/utils/formatPrizeTierFromFormValues'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'

export const EditPrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isEditPrizeTiersModalOpenAtom)

  return (
    <BottomSheet isOpen={isOpen} closeModal={() => setIsOpen(false)} header='Edit Prize Tiers'>
      <SimpleEdit />
    </BottomSheet>
  )
}

const SimpleEdit = () => {
  const setIsEditPrizeTierModalOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const [prizeTierEdits, setPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()
  const [selectedPrizeTierHistoryContractId] = useAtom(selectedPrizeTierHistoryContractIdAtom)
  const prizeTierHistoryContract = prizeTierHistoryContracts.find(
    (contract) => contract.id === selectedPrizeTierHistoryContractId
  )
  const { data: upcomingPrizeTier, isFetched: isPrizeTierFetched } =
    usePrizeTierHistoryData(prizeTierHistoryContract)
  const [isAdvancedDisplay, setAdvancedDisplay] = useState(false)

  const onSubmit = useCallback(
    (formValues: EditPrizeTierFormValues) => {
      // Recalculating prize in case of fast submissions:
      const bitRange = parseInt(formValues.bitRangeSize)
      const totalPrizeValue = formValues.tiers.reduce(
        (a, b, i) => a + Number(b.value) * calculateNumberOfPrizesForTierIndex(bitRange, i),
        0
      )
      formValues.prize = totalPrizeValue.toString()

      const newPrizeTierEdits = formatPrizeTierFromFormValues(
        formValues,
        prizeTierHistoryContract.token.decimals
      )
      setPrizeTierEdits((prizeTierEdits) => {
        // TODO: should check if edits actually make it different from existing data
        const updatedPrizeTierEdits = { ...prizeTierEdits }
        if (!updatedPrizeTierEdits[prizeTierHistoryContract.chainId]) {
          updatedPrizeTierEdits[prizeTierHistoryContract.chainId] = {}
        }
        updatedPrizeTierEdits[prizeTierHistoryContract.chainId][prizeTierHistoryContract.address] =
          {
            ...updatedPrizeTierEdits[prizeTierHistoryContract.chainId][
              prizeTierHistoryContract.address
            ],
            ...newPrizeTierEdits
          }
        return updatedPrizeTierEdits
      })
      setIsEditPrizeTierModalOpen(false)
    },
    [
      prizeTierHistoryContract.chainId,
      prizeTierHistoryContract.address,
      setIsEditPrizeTierModalOpen,
      setPrizeTierEdits,
      prizeTierHistoryContract.token.decimals
    ]
  )

  const defaultValues = useMemo(() => {
    const existingEdits =
      prizeTierEdits?.[prizeTierHistoryContract.chainId]?.[prizeTierHistoryContract.address]
    if (!!existingEdits) {
      return formatFormValuesFromPrizeTier(existingEdits, prizeTierHistoryContract.token.decimals, {
        round: true
      })
    }
    return formatFormValuesFromPrizeTier(
      upcomingPrizeTier,
      prizeTierHistoryContract.token.decimals,
      {
        round: true
      }
    )
  }, [
    upcomingPrizeTier,
    prizeTierHistoryContract.chainId,
    prizeTierHistoryContract.address,
    prizeTierEdits,
    prizeTierHistoryContract.token.decimals
  ])

  return (
    <div>
      <PrizePoolTitle prizeTierHistoryContract={prizeTierHistoryContract} className='text-lg' />
      <button className='mb-4 opacity-60' onClick={() => setAdvancedDisplay(!isAdvancedDisplay)}>
        {isAdvancedDisplay ? 'Hide' : 'Show'} advanced options
      </button>
      {!!selectedPrizeTierHistoryContractId && isPrizeTierFetched && (
        <EditPrizeTierHistoryForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          decimals={parseInt(prizeTierHistoryContract.token.decimals)}
          displayAdvancedOptions={isAdvancedDisplay}
        />
      )}
    </div>
  )
}
