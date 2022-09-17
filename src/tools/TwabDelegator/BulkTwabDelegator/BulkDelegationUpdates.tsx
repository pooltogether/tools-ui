import { EditedIconAndCount } from '@twabDelegator/DelegationList/ListStateActions'
import { DelegationFund, DelegationUpdate } from '@twabDelegator/interfaces'
import { useTranslation } from 'next-i18next'

export const BulkDelegationUpdates: React.FC<{
  csvUpdates: {
    delegationUpdates: DelegationUpdate[]
    delegationCreations: DelegationUpdate[]
    delegationFunds: DelegationFund[]
  }
}> = (props) => {
  const { csvUpdates } = props
  const { delegationUpdates, delegationCreations, delegationFunds } = csvUpdates
  const { t } = useTranslation()
  const isUpdates =
    delegationUpdates.length > 0 || delegationCreations.length > 0 || delegationFunds.length > 0

  if (!isUpdates) return null

  return (
    <>
      <span className='opacity-80 text-xxs'>Updates</span>
      <div className='flex space-x-2 items-center pl-2'>
        <EditedIconAndCount
          count={delegationCreations.length}
          icon='plus-circle'
          tooltipText={t('createSlot')}
        />
        <EditedIconAndCount
          count={delegationFunds.length}
          icon='dollar-sign'
          tooltipText={t('fundDelegatee')}
        />
        <EditedIconAndCount
          count={delegationUpdates.length}
          icon='edit-2'
          tooltipText={t('editDelegatee')}
        />
      </div>
    </>
  )
}
