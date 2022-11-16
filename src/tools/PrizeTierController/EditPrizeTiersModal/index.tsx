import { DepositToken } from '@components/PrizePool/DepositToken'
import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { BottomSheet, Tabs } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import {
  // EditPrizeTierModalState,
  // editPrizeTierModalStateAtom,
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  selectedPrizePoolIdAtom,
  selectedPrizeTierHistoryAddressAtom,
  selectedPrizeTierHistoryChainIdAtom
} from '@prizeTierController/atoms'
import { EditPrizeTierHistoryForm } from '@prizeTierController/EditPrizeTiersModal/EditPrizeTierHistoryForm'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { PrizePoolTitle } from '@prizeTierController/PrizeTierHistoryList'
import { getFormValuesFromPrizeTier } from '@prizeTierController/utils/getFormValuesFromPrizeTier'
import { getPrizeTierFromFormValues } from '@prizeTierController/utils/getPrizeTierFromFormValues'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'

export const EditPrizeTiersModal = (props: {}) => {
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
  const setSelectedPrizeTierHistoryChainId = useUpdateAtom(selectedPrizeTierHistoryChainIdAtom)
  const [prizeTierHistoryAddress, setSelectedPrizeTierHistoryAddress] = useAtom(
    selectedPrizeTierHistoryAddressAtom
  )
  const prizePools = usePrizePools()
  const [selectedPrizePoolId, setSelectedPrizePoolId] = useAtom(selectedPrizePoolIdAtom)
  const prizePool = prizePools.find((prizePool) => prizePool.id() === selectedPrizePoolId)
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)

  const onSubmit = useCallback(
    (formValues: EditPrizeTierFormValues) => {
      const newPrizeTierEdits = getPrizeTierFromFormValues(formValues, tokens?.token.decimals)
      setPrizeTierEdits((prizeTierEdits) => {
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
      return getFormValuesFromPrizeTier(existingEdits, tokens.token.decimals, { roundTiers: true })
    }
    return getFormValuesFromPrizeTier(data.upcomingPrizeTier, tokens.token.decimals, {
      roundTiers: true
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
      {/* <select
        name='drawIds'
        id='drawIds'
        className={classNames(
          'font-semibold transition border-2 border-accent-4 hover:border-default rounded-lg',
          'px-3 flex flex-row text-xs xs:text-sm hover:text-inverse bg-primary'
        )}
        onChange={(event) => {
          setSelectedPrizePoolId(event.target.value)
          const prizePool = prizePools.find((prizePool) => prizePool.id() === event.target.value)
          setSelectedPrizeTierHistoryAddress(prizePool.prizeTierHistoryMetadata.address)
          setSelectedPrizeTierHistoryChainId(prizePool.chainId)
        }}
        value={selectedPrizePoolId}
      >
        {prizePools.map((prizePool) => (
          <option key={`pt-option-${prizePool.id()}`} value={prizePool.id()}>
            <div className='space-x-2'>
              <span>{getNetworkNiceNameByChainId(prizePool.chainId)}</span>{' '}
              <span>
                <DepositToken prizePool={prizePool} />
              </span>
            </div>
          </option>
        ))}
      </select> */}
      {!!selectedPrizePoolId && isTokensFetched && isPrizeTierFetched && (
        <EditPrizeTierHistoryForm onSubmit={onSubmit} defaultValues={defaultValues} />
      )}
    </div>
  )
}
