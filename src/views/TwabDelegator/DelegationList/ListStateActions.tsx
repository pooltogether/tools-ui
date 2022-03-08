import {
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
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
import { useAtom } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { ListState } from '.'

interface ListStateActionsProps {
  listState: ListState
  transactionPending: boolean
  setListState: (listState: ListState) => void
}

export const ListStateActions: React.FC<ListStateActionsProps> = (props) => {
  const { listState, transactionPending, setListState } = props
  const [editsCount] = useAtom(delegationUpdatesCountAtom)
  const [creationsCount] = useAtom(delegationCreationsCountAtom)
  const [fundsCount] = useAtom(delegationFundsCountAtom)
  const [withdrawlsCount] = useAtom(delegationWithdrawlsCountAtom)
  const setIsConfirmationModalOpen = useUpdateAtom(delegationUpdatesModalOpenAtom)
  const resetDelegationUpdates = useResetAtom(delegationUpdatesAtom)
  const resetDelegationCreations = useResetAtom(delegationCreationsAtom)
  const resetDelegationFunds = useResetAtom(delegationFundsAtom)
  const resetDelegationWithdrawals = useResetAtom(delegationWithdrawalsAtom)

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
        <div className='flex space-x-2'>
          <span>c: {creationsCount} </span>
          <span>e: {editsCount} </span>
          <span>f: {fundsCount} </span>
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
