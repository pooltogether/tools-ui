import { BottomSheet } from '@pooltogether/react-components'
import {
  isSavePrizeTiersModalOpenAtom,
  savePrizeTiersModalStateAtom,
  SavePrizeTiersModalState
} from '@prizeTierController/atoms'
import { useAtom } from 'jotai'

export const SavePrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isSavePrizeTiersModalOpenAtom)
  const [modalState, setModalState] = useAtom(savePrizeTiersModalStateAtom)

  return (
    <BottomSheet isOpen={isOpen} closeModal={() => setIsOpen(false)}>
      {modalState === SavePrizeTiersModalState.review && <ReviewEdits />}
      {modalState === SavePrizeTiersModalState.txs && <SaveEdits />}
    </BottomSheet>
  )
}

const ReviewEdits = (props: {}) => {
  // TODO: Show every edit that has been made in a easy to view list
  // TODO: Add "next" or "this looks good" button to go to the "save edits" view
  return <></>
}

const SaveEdits = (props: {}) => {
  // TODO: Set drawId to at LEAST `getNewestDrawId() + 1` - ensure this cannot be changed between transactions
  // TODO: Show all TXs to be executed (push)
  // TODO: Show context for every TX being executed -> ready, ongoing, completed w/ block explorer link, failed, etc
  // TODO: Use `TXButton` or `TransactionButton`?
  // TODO: Use `useSendTransaction` to actually send tx data
  return <></>
}
