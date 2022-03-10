import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import { sToD, shorten, msToS, sToM } from '@pooltogether/utilities'
import {
  delegationUpdatesAtom,
  delegationWithdrawalsAtom,
  editDelegationModalOpenAtom,
  removeDelegationWithdrawalAtom,
  addDelegationWithdrawalAtom,
  delegationFundsAtom,
  delegationIdToEditAtom,
  createDelegationModalOpenAtom,
  delegationCreationsAtom
} from '@twabDelegator/atoms'
import {
  Delegation,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { DelegationListProps, ListState } from '.'
import {
  BlockExplorerLink,
  CheckboxInputGroup,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { formatUnits } from 'ethers/lib/utils'
import { useDelegatorsUpdatedTwabDelegations } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegations'
import { useTicket } from '@hooks/v4/useTicket'
import { getDelegatee } from '@twabDelegator/utils/getDelegatee'
import { getBalance } from '@twabDelegator/utils/getBalance'
import { getDuration } from '@twabDelegator/utils/getDuration'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from '@constants/misc'

export interface ActiveStateProps extends DelegationListProps {
  delegator: string
  listState: ListState
  transactionPending: boolean
  setListState: (listState: ListState) => void
}

/**
 * @param props
 * @returns
 */
export const ActiveState: React.FC<ActiveStateProps> = (props) => {
  const { chainId, className, listState, setListState, delegator, transactionPending } = props
  const { data: delegations } = useDelegatorsUpdatedTwabDelegations(chainId, delegator)
  return (
    <>
      <ul className={className}>
        {delegations.map((delegation) => (
          <DelegationRow
            {...delegation}
            key={`slot-${delegation.delegationId.slot.toString()}`}
            chainId={chainId}
            listState={listState}
            transactionPending={transactionPending}
          />
        ))}
      </ul>
      <AddSlotButton
        className='mx-auto mt-4'
        chainId={chainId}
        delegator={delegator}
        listState={listState}
        setListState={setListState}
        transactionPending={transactionPending}
      />
    </>
  )
}

interface DelegationRowProps {
  listState: ListState
  chainId: number
  transactionPending: boolean
  delegationId: DelegationId
  delegation?: Delegation
  delegationUpdate?: DelegationUpdate
  delegationCreation?: DelegationUpdate
  delegationFund?: DelegationFund
}

/**
 * TODO: Mobile hiding data so it fits on the screen...
 * @param props
 * @returns
 */
const DelegationRow: React.FC<DelegationRowProps> = (props) => {
  const {
    chainId,
    delegationId,
    delegation,
    delegationCreation,
    delegationUpdate,
    delegationFund,
    listState,
    transactionPending
  } = props
  const { slot } = delegationId
  const ticket = useTicket(chainId)

  const delegatee = getDelegatee(delegation, delegationCreation, delegationUpdate)
  const delegateeDisplay = shorten({ hash: delegatee })

  const balance = getBalance(delegation, delegationFund)
  const balanceDisplay = formatUnits(balance, ticket.decimals)
  const duration = getDuration(delegation, delegationCreation, delegationUpdate)
  const currentTimeInSeconds = msToS(Date.now()).toFixed(0)
  const isLocked = delegation?.lockUntil.gt(currentTimeInSeconds) || false
  const isEdited = !!delegationUpdate || !!delegationCreation
  const isZeroBalance = delegation?.balance.isZero()

  // TODO: Make slot column smaller
  // TODO: Make edit column smaller
  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-1 first:border-t border-b border-pt-purple border-opacity-50',
        {
          'grid-cols-4': listState !== ListState.edit,
          'grid-cols-5': listState === ListState.edit,
          'opacity-50':
            (listState === ListState.edit || listState === ListState.withdraw) && isLocked
        }
      )}
    >
      <div className='flex space-x-2'>
        {listState === ListState.withdraw && (
          <DelegationWithdrawToggle
            {...props}
            isZeroBalance={isZeroBalance}
            isLocked={isLocked}
            transactionPending={transactionPending}
          />
        )}
        <span className='font-bold opacity-60'>{slot.toString()}</span>
      </div>
      <DelegateeDisplay chainId={chainId} delegatee={delegatee} />
      <span>{balanceDisplay}</span>
      <LockDisplay duration={duration} isEdited={isEdited} />
      {listState === ListState.edit && (
        <div className='flex justify-end space-x-1'>
          <DelegationEditToggle
            {...props}
            isZeroBalance={isZeroBalance}
            isLocked={isLocked}
            transactionPending={transactionPending}
          />
        </div>
      )}
    </li>
  )
}

const DelegateeDisplay: React.FC<{ chainId: number; delegatee: string }> = ({
  chainId,
  delegatee
}) => <BlockExplorerLink chainId={chainId} address={delegatee} shorten noIcon />

/**
 * NOTE: Not updating time live. Relies on a rerender when a delegation goes from locked to unlocked.
 * @param props
 */
const LockDisplay: React.FC<{
  duration: number
  isEdited: boolean
}> = (props) => {
  const { duration, isEdited } = props

  const isLocked = duration > 0

  const getDurationDisplay = () => {
    if (!isLocked) {
      return <span className='font-bold'>unlocked</span>
    }

    let formattedDuration, units
    if (duration >= SECONDS_PER_DAY) {
      formattedDuration = Math.round(sToD(duration))
      console.log({ formattedDuration })
      units = formattedDuration === 1 ? 'day' : 'days'
    } else if (duration >= SECONDS_PER_HOUR) {
      formattedDuration = Math.round(sToM(duration))
      units = formattedDuration === 1 ? 'minute' : 'minutes'
    } else if (duration > 0) {
      formattedDuration = duration
      units = formattedDuration === 1 ? 'second' : 'seconds'
    }
    return (
      <div className='flex space-x-1'>
        <span className='font-bold'>{formattedDuration}</span>
        <span className='opacity-50'>{`${units}`}</span>
        {!isEdited && <span className='opacity-50'>left</span>}
      </div>
    )
  }

  const icon = isLocked ? 'lock' : 'unlock'

  const durationDisplay = getDurationDisplay()
  return (
    <div className='flex items-center space-x-1'>
      <FeatherIcon icon={icon} className='w-4 h-4' />
      {durationDisplay}
    </div>
  )
}

/**
 * TODO: Disable if locked
 * @param props
 * @returns
 */
const DelegationWithdrawToggle: React.FC<
  DelegationRowProps & {
    isZeroBalance: boolean
    isLocked: boolean
    transactionPending: boolean
  }
> = (props) => {
  const { delegationId, transactionPending, isZeroBalance, isLocked } = props
  const delegationWithdrawal = useDelegationWithdrawal(delegationId)
  const addDelegationWithdrawal = useUpdateAtom(addDelegationWithdrawalAtom)
  const removeDelegationWithdrawal = useUpdateAtom(removeDelegationWithdrawalAtom)
  const amount = delegationWithdrawal?.amount

  return (
    <CheckboxInputGroup
      disabled={transactionPending || isLocked || isZeroBalance}
      checked={amount?.isZero()}
      handleClick={() =>
        amount?.isZero()
          ? removeDelegationWithdrawal(delegationId)
          : addDelegationWithdrawal(delegationId)
      }
    />
  )
}

// TODO: Not opening the right one?.
// Edit a slot. Close modal. Click edit on a different slot. Edits from the first are visible.
const DelegationEditToggle: React.FC<
  DelegationRowProps & {
    isZeroBalance: boolean
    isLocked: boolean
    transactionPending: boolean
  }
> = (props) => {
  const {
    delegationId,
    transactionPending,
    isLocked,
    delegationCreation,
    delegationFund,
    delegationUpdate
  } = props
  const setIsOpen = useUpdateAtom(editDelegationModalOpenAtom)
  const setDelegationIdToEdit = useUpdateAtom(delegationIdToEditAtom)

  return (
    <button
      className='flex space-x-1'
      onClick={() => {
        setDelegationIdToEdit(delegationId)
        setIsOpen(true)
      }}
      disabled={transactionPending || isLocked}
    >
      {delegationCreation && <FeatherIcon icon='plus-circle' className='w-4 h-4 text-yellow' />}
      {delegationFund && <FeatherIcon icon='dollar-sign' className='w-4 h-4 text-yellow' />}
      {delegationUpdate && <FeatherIcon icon='edit-2' className='w-4 h-4 text-yellow' />}
      <FeatherIcon icon='edit' className='w-4 h-4' />
    </button>
  )
}

const AddSlotButton: React.FC<{
  chainId: number
  delegator: string
  listState: ListState
  setListState: (listState: ListState) => void
  transactionPending: boolean
  className?: string
}> = (props) => {
  const { className, listState, transactionPending, delegator, setListState } = props
  const usersAddress = useUsersAddress()
  const setIsOpen = useUpdateAtom(createDelegationModalOpenAtom)

  if (listState === ListState.withdraw || usersAddress !== delegator) return null

  return (
    <SquareButton
      theme={SquareButtonTheme.tealOutline}
      className={classNames(className, 'w-32')}
      size={SquareButtonSize.sm}
      onClick={() => {
        setListState(ListState.edit)
        setIsOpen(true)
      }}
      disabled={transactionPending}
    >
      <FeatherIcon icon='plus' className='w-3 h-3 my-auto mr-1' />
      <span>Add Slot</span>
    </SquareButton>
  )
}

/**
 *
 * @param delegationId
 * @returns
 */
export const useDelegationCreation = (delegationId: DelegationId) => {
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  return delegationCreations.find(
    (delegationCreation) =>
      delegationCreation.delegator === delegationId.delegator &&
      delegationCreation.slot.eq(delegationId.slot)
  )
}

/**
 *
 * @param delegationId
 * @returns
 */
export const useDelegationUpdate = (delegationId: DelegationId) => {
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  return delegationUpdates.find(
    (delegationUpdate) =>
      delegationUpdate.delegator === delegationId.delegator &&
      delegationUpdate.slot.eq(delegationId.slot)
  )
}

/**
 *
 * @param delegationId
 * @returns
 */
export const useDelegationFund = (delegationId: DelegationId) => {
  const [delegationFunds] = useAtom(delegationFundsAtom)
  return delegationFunds.find(
    (delegationFund) =>
      delegationFund.delegator === delegationId.delegator &&
      delegationFund.slot.eq(delegationId.slot)
  )
}

/**
 *
 * @param delegationId
 * @returns
 */
export const useDelegationWithdrawal = (delegationId: DelegationId) => {
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)
  return delegationWithdrawals.find(
    (delegationWithdrawal) =>
      delegationWithdrawal.delegator === delegationId.delegator &&
      delegationWithdrawal.slot.eq(delegationId.slot)
  )
}
