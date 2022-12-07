import { BottomSheet, Button } from '@pooltogether/react-components'
import { isSavePrizeTiersModalOpenAtom } from '@prizeTierController/atoms'
import { useAllPrizePoolConfigEdits } from '@prizeTierController/hooks/useAllPrizePoolConfigEdits'
import { useDrawBeaconDrawId } from '@prizeTierController/hooks/useDrawBeaconDrawId'
import { PrizePoolEditHistory } from '@prizeTierController/interfaces'
import { DrawIdForm } from '@prizeTierController/SavePrizeTiersModal/DrawIdForm'
import { PrizePoolEditsDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolEditsDisplay'
import { PrizePoolTransactionDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolTransactionDisplay'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

enum SavePrizeTiersModalState {
  'review' = 'review',
  'txs' = 'txs'
}

export const SavePrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isSavePrizeTiersModalOpenAtom)
  const [modalState, setModalState] = useState<SavePrizeTiersModalState>(
    SavePrizeTiersModalState.review
  )
  const allPrizePoolConfigEdits = useAllPrizePoolConfigEdits()
  const { t } = useTranslation()

  return (
    <BottomSheet
      isOpen={isOpen}
      closeModal={() => {
        setIsOpen(false)
        setModalState(SavePrizeTiersModalState.review)
      }}
      header={
        modalState === SavePrizeTiersModalState.review
          ? t('reviewTransactions')
          : t('submitTransactions')
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
  const { t } = useTranslation()

  return (
    <>
      <button className='mb-4 opacity-60' onClick={() => setRawDisplay(!isRawDisplay)}>
        {isRawDisplay ? t('hideRawValues') : t('showRawValues')}
      </button>
      <ul className='flex flex-col gap-4 mb-4'>
        {allEdits.map(
          (editHistory) =>
            !!editHistory &&
            !!editHistory.newConfig && (
              <PrizePoolEditsDisplay
                prizeTierHistoryContract={editHistory.prizeTierHistoryContract}
                oldConfig={editHistory.oldConfig}
                newConfig={editHistory.newConfig}
                edits={editHistory.edits}
                displayRawValues={isRawDisplay}
                key={`prizePoolEdits-${editHistory.prizeTierHistoryContract.id}`}
              />
            )
        )}
      </ul>
      {allEdits.every((editHistory) => !!editHistory && !editHistory.edits.edited) ? (
        t('noEdits')
      ) : (
        <Button type='button' onClick={() => onContinue()}>
          {t('continue')}
        </Button>
      )}
    </>
  )
}

const SaveEdits = (props: { allEdits: PrizePoolEditHistory[] }) => {
  const { allEdits } = props
  const { data: nextDrawId, isFetched } = useDrawBeaconDrawId()
  const [drawId, setDrawId] = useState(0)
  const { t } = useTranslation()

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
                !!editHistory &&
                !!editHistory.newConfig && (
                  <PrizePoolTransactionDisplay
                    prizeTierHistoryContract={editHistory.prizeTierHistoryContract}
                    newConfig={editHistory.newConfig}
                    edits={editHistory.edits}
                    drawId={drawId}
                    key={`prizePoolTXs-${editHistory.prizeTierHistoryContract.id}`}
                  />
                )
            )}
          </ul>
        </>
      ) : (
        t('loading')
      )}
    </>
  )
}
