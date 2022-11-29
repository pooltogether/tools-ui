import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { BottomSheet } from '@pooltogether/react-components'
import { calculateNumberOfPrizesForTierIndex } from '@pooltogether/v4-utils-js'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  selectedPrizePoolIdAtom,
  selectedPrizeTierHistoryAddressAtom
} from '@prizeTierController/atoms'
import { EditPrizeTierHistoryForm } from '@prizeTierController/EditPrizeTiersModal/EditPrizeTierHistoryForm'
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
  const [prizeTierHistoryAddress] = useAtom(selectedPrizeTierHistoryAddressAtom)
  const prizePools = usePrizePools()
  const [selectedPrizePoolId] = useAtom(selectedPrizePoolIdAtom)
  const prizePool = prizePools.find((prizePool) => prizePool.id() === selectedPrizePoolId)
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)
  const { data: upcomingPrizeTier, isFetched: isPrizeTierFetched } =
    usePrizeTierHistoryData(prizePool)
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
    return formatFormValuesFromPrizeTier(upcomingPrizeTier, tokens.token.decimals, {
      round: true
    })
  }, [
    upcomingPrizeTier,
    prizePool.chainId,
    prizePool.prizeTierHistoryMetadata.address,
    prizeTierEdits,
    tokens.token.decimals
  ])

  return (
    <div>
      <PrizePoolTitle prizePool={prizePool} className='text-lg' />
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
