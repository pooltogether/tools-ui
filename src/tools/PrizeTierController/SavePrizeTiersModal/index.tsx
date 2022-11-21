import { BottomSheet, Button } from '@pooltogether/react-components'
import {
  isSavePrizeTiersModalOpenAtom,
  savePrizeTiersModalStateAtom,
  SavePrizeTiersModalState
  // prizeTierEditsAtom
} from '@prizeTierController/atoms'
import { useAtom } from 'jotai'

export const SavePrizeTiersModal = () => {
  const [isOpen, setIsOpen] = useAtom(isSavePrizeTiersModalOpenAtom)
  const [modalState, setModalState] = useAtom(savePrizeTiersModalStateAtom)

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

// TODO: use useIsUserDelegatorsRepresentative as example for checking contract owner/manager for each prize pool
//  ^ modal should only allow transactions from wallets that are the owner/manager of a given pool

const ReviewEdits = (props: { onContinue: Function }) => {
  const { onContinue } = props
  // const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  // TODO: Show every edit that has been made in a easy to view list
  return (
    <div>
      REVIEW VIEW
      <Button type='button' onClick={() => onContinue()}>
        Continue
      </Button>
    </div>
  )
}

const SaveEdits = (props: {}) => {
  // TODO: Set drawId to at LEAST `getNewestDrawId() + 1` - ensure this cannot be changed between transactions
  // TODO: Show all TXs to be executed (push)
  // TODO: Show context for every TX being executed -> ready, ongoing, completed w/ block explorer link, failed, etc
  // TODO: Use `TXButton` or `TransactionButton`?
  // TODO: Use `useSendTransaction` to actually send tx data
  return <div>TXS VIEW</div>
}
