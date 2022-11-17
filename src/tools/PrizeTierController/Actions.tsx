import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { isSavePrizeTiersModalOpenAtom, prizeTierEditsAtom } from '@prizeTierController/atoms'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'

export const Actions = (props: { className?: string }) => {
  const { className } = props
  const setIsOpen = useUpdateAtom(isSavePrizeTiersModalOpenAtom)
  const resetForm = useResetAtom(prizeTierEditsAtom)
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)

  let editedPools: { chain: string; address: string }[] = []
  Object.keys(allPrizeTierEdits).forEach((chain) => {
    Object.keys(allPrizeTierEdits[chain]).forEach((address) => {
      editedPools.push({ chain, address })
    })
  })

  return (
    <div className={classNames(className, 'w-full flex justify-end space-x-2')}>
      {editedPools.length > 0 && (
        <Button
          onClick={() => {
            resetForm()
          }}
          size={ButtonSize.sm}
          theme={ButtonTheme.orangeOutline}
        >
          Reset Edits
        </Button>
      )}
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
        size={ButtonSize.sm}
        disabled={editedPools.length === 0}
      >
        Save Edits
      </Button>
    </div>
  )
}
