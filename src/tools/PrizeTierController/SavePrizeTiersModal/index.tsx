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
  // TODO
  // TODO: This modal should also check that the signer is the owner or manager of the contract.
  return <></>
}

const SaveEdits = (props: {}) => {
  // TODO
  return <></>
}
