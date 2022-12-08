import { Button, ButtonTheme, ButtonSize, Tabs } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import {
  isListCollapsed,
  isSavePrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  SelectedView,
  selectedView
} from '@prizeTierController/atoms'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'

export const Actions = (props: { className?: string }) => {
  const { className } = props
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [currentView, setSelectedView] = useAtom(selectedView)

  const editedPools: { chainId: string; address: string }[] = []
  Object.keys(allPrizeTierEdits).forEach((chainId) => {
    Object.keys(allPrizeTierEdits[chainId]).forEach((address) => {
      editedPools.push({ chainId, address })
    })
  })

  return (
    <div className={classNames(className, 'w-full flex justify-between items-center')}>
      <div className='flex items-center gap-3'>
        <Tabs
          initialTabId={currentView}
          onTabSelect={(tab) => setSelectedView(tab.id as SelectedView)}
          tabs={[
            { id: SelectedView.configuration, title: 'Configurations', view: <></> },
            { id: SelectedView.projection, title: 'Projections', view: <></> }
          ]}
        />
      </div>
      <div className='flex items-center gap-3'>
        <ToggleCollapsedButton />
        {editedPools.length > 0 && <ResetButton />}
        <SaveButton disabled={editedPools.length === 0} />
      </div>
    </div>
  )
}

const ToggleCollapsedButton = () => {
  const [isCollapsed, setIsCollapsed] = useAtom(isListCollapsed)
  const { t } = useTranslation()

  return (
    <button className='text-xxs opacity-80' onClick={() => setIsCollapsed(!isCollapsed)}>
      {isCollapsed ? t('expandAll') : t('collapseAll')}
    </button>
  )
}

const ResetButton = () => {
  const resetForm = useResetAtom(prizeTierEditsAtom)
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => {
        resetForm()
      }}
      size={ButtonSize.sm}
      theme={ButtonTheme.orangeOutline}
    >
      {t('resetEdits')}
    </Button>
  )
}

const SaveButton = (props: { disabled?: boolean }) => {
  const setIsOpen = useUpdateAtom(isSavePrizeTiersModalOpenAtom)
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => {
        setIsOpen(true)
      }}
      size={ButtonSize.sm}
      disabled={usersAddress === null || props.disabled}
    >
      {t('saveEdits')}
    </Button>
  )
}
