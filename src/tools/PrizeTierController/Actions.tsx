import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import {
  EditPrizeTierModalState,
  editPrizeTierModalStateAtom,
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom
} from '@prizeTierController/atoms'
import classNames from 'classnames'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'

export const Actions = (props: { className?: string }) => {
  const { className } = props
  const setIsOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const setPrizeTierModalState = useUpdateAtom(editPrizeTierModalStateAtom)
  const resetForm = useResetAtom(prizeTierEditsAtom)

  return (
    <div className={classNames(className, 'w-full flex justify-end space-x-2')}>
      <Button
        onClick={() => {
          resetForm()
        }}
        size={ButtonSize.sm}
        theme={ButtonTheme.orangeOutline}
      >
        Reset Edits
      </Button>
      <Button
        onClick={() => {
          setPrizeTierModalState(EditPrizeTierModalState.all)
          setIsOpen(true)
        }}
        size={ButtonSize.sm}
      >
        Edit All
      </Button>
    </div>
  )
}
