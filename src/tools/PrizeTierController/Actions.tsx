import { Button, ButtonTheme, ButtonSize } from '@pooltogether/react-components'
import { checkForPrizeCompatibility } from '@prizeTierController/utils/checkForPrizeCompatibility'
import {
  allCombinedPrizeTiersAtom,
  isSavePrizeTiersModalOpenAtom,
  prizeTierEditsAtom
} from '@prizeTierController/atoms'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useUsersAddress } from '@pooltogether/wallet-connection'

export const Actions = (props: { className?: string }) => {
  const { className } = props
  const setIsOpen = useUpdateAtom(isSavePrizeTiersModalOpenAtom)
  const resetForm = useResetAtom(prizeTierEditsAtom)
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [combinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)
  const usersAddress = useUsersAddress()

  const editedPools: { chainId: string; address: string }[] = []
  Object.keys(allPrizeTierEdits).forEach((chainId) => {
    Object.keys(allPrizeTierEdits[chainId]).forEach((address) => {
      editedPools.push({ chainId, address })
    })
  })

  const prizeCompatibility = checkForPrizeCompatibility(combinedPrizeTiers)

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
        disabled={usersAddress === null || editedPools.length === 0 || !prizeCompatibility.valid}
      >
        Save Edits
      </Button>
    </div>
  )
}
