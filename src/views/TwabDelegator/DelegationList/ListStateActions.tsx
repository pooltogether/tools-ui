import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import {
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import {
  delegationUpdatesCountAtom,
  delegationFundsAtom,
  delegationFundsCountAtom,
  delegationUpdatesAtom,
  delegationUpdatesModalOpenAtom,
  delegationWithdrawalsAtom,
  delegationWithdrawlsCountAtom,
  delegationCreationsCountAtom,
  delegationCreationsAtom
} from '@twabDelegator/atoms'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { ListState } from '.'

interface ListStateActionsProps {
  chainId: number
  listState: ListState
  delegator: string
  transactionPending: boolean
  setListState: (listState: ListState) => void
}

// TODO: Cancel confirmation modal
export const ListStateActions: React.FC<ListStateActionsProps> = (props) => {
  const { chainId, listState, transactionPending, delegator, setListState } = props
  const [editsCount] = useAtom(delegationUpdatesCountAtom)
  const [creationsCount] = useAtom(delegationCreationsCountAtom)
  const [fundsCount] = useAtom(delegationFundsCountAtom)
  const [withdrawlsCount] = useAtom(delegationWithdrawlsCountAtom)
  const setIsConfirmationModalOpen = useUpdateAtom(delegationUpdatesModalOpenAtom)
  const resetDelegationUpdates = useResetAtom(delegationUpdatesAtom)
  const resetDelegationCreations = useResetAtom(delegationCreationsAtom)
  const resetDelegationFunds = useResetAtom(delegationFundsAtom)
  const resetDelegationWithdrawals = useResetAtom(delegationWithdrawalsAtom)
  const usersAddress = useUsersAddress()
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(chainId, delegator)

  if (usersAddress !== delegator) return null

  // TODO: Show error warning if total spend is higher than users ticket balance
  if (listState === ListState.edit) {
    return (
      <div className='flex justify-between space-x-2'>
        <SquareButton
          className='w-24'
          size={SquareButtonSize.sm}
          disabled={transactionPending}
          onClick={() => {
            resetDelegationUpdates()
            resetDelegationCreations()
            resetDelegationFunds()
            setListState(ListState.readOnly)
          }}
          theme={SquareButtonTheme.tealOutline}
        >
          Cancel
        </SquareButton>
        <div className='flex space-x-2 items-center'>
          <EditedIconAndCount count={creationsCount} icon='plus-circle' />
          <EditedIconAndCount count={fundsCount} icon='dollar-sign' />
          <EditedIconAndCount count={editsCount} icon='edit-2' />
          {isBalanceSufficient !== null && !isBalanceSufficient && (
            <FeatherIcon icon='alert-triangle' className='w-4 h-4 text-pt-red-light' />
          )}
          <SquareButton
            className='flex space-x-2'
            size={SquareButtonSize.sm}
            onClick={() => setIsConfirmationModalOpen(true)}
            disabled={!fundsCount && !editsCount && !creationsCount}
          >
            <span>{transactionPending ? 'Saving changes' : 'Save Changes'}</span>
            {transactionPending && <ThemedClipSpinner sizeClassName='w-4 h-4' />}
          </SquareButton>
        </div>
      </div>
    )
  } else if (listState === ListState.withdraw) {
    return (
      <div className='flex justify-between space-x-2'>
        <SquareButton
          className='w-24'
          size={SquareButtonSize.sm}
          onClick={() => {
            resetDelegationWithdrawals()
            setListState(ListState.readOnly)
          }}
          theme={SquareButtonTheme.tealOutline}
          disabled={transactionPending}
        >
          Cancel
        </SquareButton>
        <SquareButton
          className='flex space-x-2'
          size={SquareButtonSize.sm}
          onClick={() => setIsConfirmationModalOpen(true)}
          disabled={!withdrawlsCount}
        >
          <span>
            {transactionPending
              ? 'Withdrawing'
              : withdrawlsCount
              ? `Withdraw (${withdrawlsCount})`
              : 'Withdraw'}
          </span>
          {transactionPending && <ThemedClipSpinner sizeClassName='w-3 h-3' />}
        </SquareButton>
      </div>
    )
  }

  return (
    <div className='flex justify-end space-x-2'>
      <SquareButton
        className='w-24'
        size={SquareButtonSize.sm}
        onClick={() => setListState(ListState.withdraw)}
        disabled={transactionPending}
      >
        Withdraw
      </SquareButton>
      <SquareButton
        className='w-24'
        size={SquareButtonSize.sm}
        onClick={() => setListState(ListState.edit)}
        disabled={transactionPending}
      >
        Edit
      </SquareButton>
    </div>
  )
}

const EditedIconAndCount: React.FC<{ count: number; icon: string }> = ({ count, icon }) => {
  if (count < 1) return null
  return (
    <div className='flex space-x-1'>
      <span className='text-xxxs'>{count}</span>
      <FeatherIcon icon={icon} className='w-4 h-4 text-yellow' />
    </div>
  )
}
