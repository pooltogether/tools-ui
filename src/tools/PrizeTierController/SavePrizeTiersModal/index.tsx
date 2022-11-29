import { usePrizePools } from '@hooks/usePrizePools'
import { BottomSheet, Button } from '@pooltogether/react-components'
import {
  isSavePrizeTiersModalOpenAtom,
  allCombinedPrizeTiersAtom
} from '@prizeTierController/atoms'
import { useAllPrizeTierHistoryData } from '@prizeTierController/hooks/useAllPrizeTierHistoryData'
import { useDrawBeaconDrawId } from '@prizeTierController/hooks/useDrawBeaconDrawId'
import { PrizePoolEditHistory } from '@prizeTierController/interfaces'
import { DrawIdForm } from '@prizeTierController/SavePrizeTiersModal/DrawIdForm'
import { PrizePoolEditsDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolEditsDisplay'
import { PrizePoolTransactionDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolTransactionDisplay'
import { checkForPrizeEdits } from '@prizeTierController/utils/checkForPrizeEdits'
import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'

enum SavePrizeTiersModalState {
  'review' = 'review',
  'txs' = 'txs'
}

export const SavePrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isSavePrizeTiersModalOpenAtom)
  const [modalState, setModalState] = useState<SavePrizeTiersModalState>(
    SavePrizeTiersModalState.review
  )
  const prizePools = usePrizePools()
  const { data, isFetched } = useAllPrizeTierHistoryData()
  const [combinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)

  const allPrizePoolConfigEdits = useMemo(() => {
    if (isFetched) {
      return prizePools.map((prizePool) => {
        if (combinedPrizeTiers[prizePool.chainId]) {
          const oldConfig = data[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address]
          const newConfig =
            combinedPrizeTiers[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address]
          const edits = checkForPrizeEdits(oldConfig, newConfig)
          return { prizePool, oldConfig, newConfig, edits }
        }
      })
    }
  }, [prizePools, data, isFetched, combinedPrizeTiers])

  return (
    <BottomSheet
      isOpen={isOpen}
      closeModal={() => {
        setIsOpen(false)
        setModalState(SavePrizeTiersModalState.review)
      }}
      header={
        modalState === SavePrizeTiersModalState.review
          ? 'Review Transactions'
          : 'Submit Transactions'
      }
    >
      {modalState === SavePrizeTiersModalState.review && (
        <ReviewEdits
          allEdits={allPrizePoolConfigEdits}
          onContinue={() => setModalState(SavePrizeTiersModalState.txs)}
        />
      )}
      {modalState === SavePrizeTiersModalState.txs && (
        <SaveEdits allEdits={allPrizePoolConfigEdits} />
      )}
    </BottomSheet>
  )
}

const ReviewEdits = (props: { allEdits: PrizePoolEditHistory[]; onContinue: Function }) => {
  const { allEdits, onContinue } = props
  const [isRawDisplay, setRawDisplay] = useState(false)

  return (
    <>
      <button className='mb-4 opacity-60' onClick={() => setRawDisplay(!isRawDisplay)}>
        {isRawDisplay ? 'Hide' : 'Show'} raw values
      </button>
      <ul className='flex flex-col gap-4 mb-4'>
        {allEdits.map(
          (editHistory) =>
            editHistory && (
              <PrizePoolEditsDisplay
                prizePool={editHistory.prizePool}
                oldConfig={editHistory.oldConfig}
                newConfig={editHistory.newConfig}
                edits={editHistory.edits}
                displayRawValues={isRawDisplay}
                key={`prizePoolEdits-${editHistory.prizePool.id()}`}
              />
            )
        )}
      </ul>
      {allEdits.every((editHistory) => !editHistory.edits.edited) ? (
        'No edits.'
      ) : (
        <Button type='button' onClick={() => onContinue()}>
          Continue
        </Button>
      )}
    </>
  )
}

const SaveEdits = (props: { allEdits: PrizePoolEditHistory[] }) => {
  const { allEdits } = props
  const prizePools = usePrizePools()
  const { data: nextDrawId, isFetched } = useDrawBeaconDrawId(prizePools[0])
  const [drawId, setDrawId] = useState(0)

  return (
    <>
      {isFetched ? (
        <>
          <DrawIdForm
            onChange={(value) => setDrawId(value)}
            defaultValues={{ drawId: (nextDrawId + 1).toString() }}
            minDrawId={nextDrawId}
          />
          <ul className='flex flex-col gap-4 mb-4'>
            {allEdits.map(
              (editHistory) =>
                editHistory && (
                  <PrizePoolTransactionDisplay
                    prizePool={editHistory.prizePool}
                    newConfig={editHistory.newConfig}
                    edits={editHistory.edits}
                    drawId={drawId}
                    key={`prizePoolTXs-${editHistory.prizePool.id()}`}
                  />
                )
            )}
          </ul>
        </>
      ) : (
        'Loading...'
      )}
    </>
  )
}
