import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { isSavePrizeTiersModalOpenAtom, prizeTierEditsAtom } from '@prizeTierController/atoms'
import classNames from 'classnames'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'

export const Actions = (props: { className?: string }) => {
  const { className } = props
  const setIsOpen = useUpdateAtom(isSavePrizeTiersModalOpenAtom)
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
      {/* The save edits button should only be enabled if there were edits made and there are no errors */}
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
        size={ButtonSize.sm}
      >
        Save Edits
      </Button>
    </div>
  )
}
