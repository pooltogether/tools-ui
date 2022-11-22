import { usePrizePools } from '@hooks/usePrizePools'
import { BottomSheet, Button } from '@pooltogether/react-components'
import {
  isSavePrizeTiersModalOpenAtom,
  allCombinedPrizeTiersAtom
} from '@prizeTierController/atoms'
import { useAllPrizeTierHistoryData } from '@prizeTierController/hooks/useAllPrizeTierHistoryData'
import { usePrizeTierHistoryNewestDrawId } from '@prizeTierController/hooks/usePrizeTierHistoryNewestDrawId'
import { PrizePoolEditsDisplay } from '@prizeTierController/SavePrizeTiersModal/PrizePoolEditsDisplay'
import { DrawIdForm } from '@prizeTierController/SavePrizeTiersModal/DrawIdForm'
import { useAtom } from 'jotai'
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

  return (
    <BottomSheet
      isOpen={isOpen}
      closeModal={() => {
        setIsOpen(false)
        setModalState(SavePrizeTiersModalState.review)
      }}
    >
      {modalState === SavePrizeTiersModalState.review && (
        <ReviewEdits onContinue={() => setModalState(SavePrizeTiersModalState.txs)} />
      )}
      {modalState === SavePrizeTiersModalState.txs && <SaveEdits />}
    </BottomSheet>
  )
}

const ReviewEdits = (props: { onContinue: Function }) => {
  const { onContinue } = props
  const prizePools = usePrizePools()
  const { data, isFetched } = useAllPrizeTierHistoryData()
  const [combinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)

  return (
    <div>
      <p className='mb-4'>Review Edits:</p>
      {isFetched ? (
        <ul className='flex flex-col gap-4 mb-4'>
          {prizePools.map(
            (prizePool) =>
              combinedPrizeTiers[prizePool.chainId] && (
                <PrizePoolEditsDisplay
                  prizePool={prizePool}
                  oldConfig={data[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address]}
                  newConfig={
                    combinedPrizeTiers[prizePool.chainId][
                      prizePool.prizeTierHistoryMetadata.address
                    ]
                  }
                  key={`prizePoolEdits-${prizePool.id()}`}
                />
              )
          )}
        </ul>
      ) : (
        'Loading...'
      )}
      <Button type='button' onClick={() => onContinue()}>
        Continue
      </Button>
    </div>
  )
}

const SaveEdits = () => {
  const prizePools = usePrizePools()
  const { data, isFetched } = usePrizeTierHistoryNewestDrawId(prizePools[0])
  const [drawId, setDrawId] = useState(0)

  // TODO: Show all TXs to be executed (push)
  // TODO: modal should only allow transactions from wallets that are the owner or manager of a given pool
  // TODO: Show context for every TX being executed -> ready, ongoing, completed w/ block explorer link, failed, etc
  // TODO: Use `TXButton` or `TransactionButton`?
  // TODO: Use `useSendTransaction` to actually send tx data

  return (
    <div>
      <p className='mb-4'>Submit Transactions:</p>
      {isFetched ? (
        <DrawIdForm
          onChange={(value) => setDrawId(value)}
          defaultValues={{ drawId: (data.newestDrawId + 3).toString() }}
          minDrawId={data.newestDrawId + 1}
        />
      ) : (
        'Loading...'
      )}
    </div>
  )
}
