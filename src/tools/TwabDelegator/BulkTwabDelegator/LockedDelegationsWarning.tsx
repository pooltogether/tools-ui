import { Card } from '@pooltogether/react-components'
import { useIsADelegationLocked } from '@twabDelegator/hooks/useIsADelegationLocked'
import FeatherIcon from 'feather-icons-react'

export const LockedDelegationsWarning: React.FC<{ chainId: number; delegator: string }> = (
  props
) => {
  const { chainId, delegator } = props
  const isDelegationsLocked = useIsADelegationLocked(chainId, delegator)

  if (!isDelegationsLocked) return null

  return (
    <div className='border border-pt-red-light rounded px-4 py-4 sm:px-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4'>
      <div className='flex items-center'>
        <FeatherIcon icon='alert-triangle' className='w-4 h-4 sm:w-8 sm:h-8 text-pt-red-light' />
      </div>
      <div className='text-xxs'>
        At least one existing delegation is locked and cannot be overwritten. You can use the bulk
        delegation tool once that delegation has unlocked.
      </div>
    </div>
  )
}
