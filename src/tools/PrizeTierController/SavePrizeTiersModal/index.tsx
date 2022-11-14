import { BottomSheet } from '@pooltogether/react-components'
import { isSavePrizeTiersModalOpenAtom } from '@prizeTierController/atoms'
import { useAtom } from 'jotai'

export const SavePrizeTiersModal = (props: {}) => {
  const [isOpen, setIsOpen] = useAtom(isSavePrizeTiersModalOpenAtom)

  return (
    <BottomSheet isOpen={isOpen} closeModal={() => setIsOpen(false)}>
      {/* TODO */}
    </BottomSheet>
  )
}
