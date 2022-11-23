import { usePrizePools } from '@hooks/usePrizePools'
import { BottomSheet, Button } from '@pooltogether/react-components'
import {
  isSavePrizeTiersModalOpenAtom,
  allCombinedPrizeTiersAtom
} from '@prizeTierController/atoms'
import { useAllPrizeTierHistoryData } from '@prizeTierController/hooks/useAllPrizeTierHistoryData'
import { usePrizeTierHistoryNewestDrawId } from '@prizeTierController/hooks/usePrizeTierHistoryNewestDrawId'
import { PrizePoolEditsDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolEditsDisplay'
import { PrizePoolTransactionDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolTransactionDisplay'
import { DrawIdForm } from '@prizeTierController/SavePrizeTiersModal/DrawIdForm'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { checkForPrizeEdits } from '@prizeTierController/utils/checkForPrizeEdits'
import { PrizePoolEditHistory } from '@prizeTierController/interfaces'

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

  let allPrizePoolConfigEdits: PrizePoolEditHistory[] = []
  useEffect(() => {
    if (isFetched) {
      allPrizePoolConfigEdits = prizePools.map((prizePool) => {
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

  return (
    <div>
      <p className='mb-4'>Review Edits:</p>
      <ul className='flex flex-col gap-4 mb-4'>
        {allEdits.map((edit) => (
          <PrizePoolEditsDisplay
            prizePool={edit.prizePool}
            oldConfig={edit.oldConfig}
            newConfig={edit.newConfig}
            edits={edit.edits}
            key={`prizePoolEdits-${edit.prizePool.id()}`}
          />
        ))}
      </ul>
      ) : ( 'Loading...' )
      <Button type='button' onClick={() => onContinue()}>
        Continue
      </Button>
    </div>
  )
}

const SaveEdits = (props: { allEdits: PrizePoolEditHistory[] }) => {
  const { allEdits } = props
  const prizePools = usePrizePools()
  const { data, isFetched } = usePrizeTierHistoryNewestDrawId(prizePools[0])
  const [drawId, setDrawId] = useState(0)

  return (
    <div>
      <p className='mb-4'>Submit Transactions:</p>
      {isFetched ? (
        <>
          <DrawIdForm
            onChange={(value) => setDrawId(value)}
            defaultValues={{ drawId: (data.newestDrawId + 3).toString() }}
            minDrawId={data.newestDrawId + 1}
          />
          <ul className='flex flex-col gap-4 mb-4'>
            {allEdits.map((edit) => (
              <PrizePoolTransactionDisplay
                prizePool={edit.prizePool}
                newConfig={edit.newConfig}
                edits={edit.edits}
                drawId={drawId}
                key={`prizePoolTXs-${edit.prizePool.id()}`}
              />
            ))}
          </ul>
        </>
      ) : (
        'Loading...'
      )}
    </div>
  )
}
