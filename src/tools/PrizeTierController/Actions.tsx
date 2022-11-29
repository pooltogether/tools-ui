import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import {
  isPrizeTierListCollapsed,
  isSavePrizeTiersModalOpenAtom,
  prizeTierEditsAtom
} from '@prizeTierController/atoms'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'

export const Actions = (props: { className?: string }) => {
  const { className } = props
  const setIsOpen = useUpdateAtom(isSavePrizeTiersModalOpenAtom)
  const resetForm = useResetAtom(prizeTierEditsAtom)
  const [isCollapsed, setIsCollapsed] = useAtom(isPrizeTierListCollapsed)
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const usersAddress = useUsersAddress()

  const editedPools: { chainId: string; address: string }[] = []
  Object.keys(allPrizeTierEdits).forEach((chainId) => {
    Object.keys(allPrizeTierEdits[chainId]).forEach((address) => {
      editedPools.push({ chainId, address })
    })
  })

  return (
    <div className={classNames(className, 'w-full flex justify-end items-center space-x-2')}>
      <button className='text-xxs mr-2 opacity-80' onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Expand' : 'Collapse'} All
      </button>
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
        disabled={usersAddress === null || editedPools.length === 0}
      >
        Save Edits
      </Button>
    </div>
  )
}
