import { BottomSheet } from '@pooltogether/react-components'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  selectedPrizeTierHistoryContractIdAtom
} from '@prizeTierController/atoms'
import { EditPrizeTierHistoryForm } from '@prizeTierController/EditPrizeTiersModal/EditPrizeTierHistoryForm'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { formatFormValuesFromPrizeTier } from '@prizeTierController/utils/formatFormValuesFromPrizeTier'
import { formatPrizeTierFromFormValues } from '@prizeTierController/utils/formatPrizeTierFromFormValues'
import { formatTotalPrizeValueFromFormValues } from '@prizeTierController/utils/formatTotalPrizeValue'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import { useCallback, useMemo, useState } from 'react'

export const EditPrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isEditPrizeTiersModalOpenAtom)
  const { t } = useTranslation()

  return (
    <BottomSheet isOpen={isOpen} closeModal={() => setIsOpen(false)} header={t('editPrizeTiers')}>
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
  const { t } = useTranslation()

  const onSubmit = useCallback(
    (formValues: EditPrizeTierFormValues) => {
      // Recalculating prize in case of fast submissions:
      formValues.prize = formatTotalPrizeValueFromFormValues(
        formValues,
        prizeTierHistoryContract.token.decimals
      )

      const newPrizeTierEdits = formatPrizeTierFromFormValues(
        formValues,
        prizeTierHistoryContract.token.decimals
      )
      setPrizeTierEdits((prizeTierEdits) => {
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
        round: true,
        isV2: prizeTierHistoryContract.isV2
      })
    }
    return formatFormValuesFromPrizeTier(
      upcomingPrizeTier,
      prizeTierHistoryContract.token.decimals,
      {
        round: true,
        isV2: prizeTierHistoryContract.isV2
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
      <PrizeTierHistoryTitle
        prizeTierHistoryContract={prizeTierHistoryContract}
        className='text-lg'
      />
      <button className='mb-4 opacity-60' onClick={() => setAdvancedDisplay(!isAdvancedDisplay)}>
        {isAdvancedDisplay ? t('hideAdvancedOptions') : t('showAdvancedOptions')}
      </button>
      {!!selectedPrizeTierHistoryContractId && isPrizeTierFetched && (
        <EditPrizeTierHistoryForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          decimals={parseInt(prizeTierHistoryContract.token.decimals)}
          displayAdvancedOptions={isAdvancedDisplay}
          isV2={prizeTierHistoryContract.isV2}
        />
      )}
    </div>
  )
}
