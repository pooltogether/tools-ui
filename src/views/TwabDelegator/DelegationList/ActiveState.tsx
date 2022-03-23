import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { sToD, shorten, msToS, sToM, numberWithCommas } from '@pooltogether/utilities'
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
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { DelegationListProps, ListState } from '.'
import {
  Amount,
  BlockExplorerLink,
  CheckboxInputGroup,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  TokenIcon,
  Tooltip
} from '@pooltogether/react-components'
import { useDelegatorsUpdatedTwabDelegations } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegations'
import { useTicket } from '@hooks/v4/useTicket'
import { getDelegatee } from '@twabDelegator/utils/getDelegatee'
import { getBalance } from '@twabDelegator/utils/getBalance'
import { getDuration } from '@twabDelegator/utils/getDuration'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from '@constants/misc'
import { BigNumber } from 'ethers'
import classNames from 'classnames'
import { ScreenSize, useScreenSize } from '@pooltogether/hooks'

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
    <div className={classNames(className, 'flex flex-col')}>
      <ul>
        <ListHeaders listState={listState} />
        {delegations.map((delegation) => (
          <DelegationRow
            {...delegation}
            key={`slot-${delegation.delegationId.slot.toString()}-${listState}`}
            chainId={chainId}
            listState={listState}
            transactionPending={transactionPending}
          />
        ))}
      </ul>
      <AddSlotButton
        className='mx-auto mt-8'
        chainId={chainId}
        delegator={delegator}
        listState={listState}
        setListState={setListState}
        transactionPending={transactionPending}
      />
    </div>
  )
}

const ListHeaders: React.FC<{ listState: ListState }> = (props) => {
  const { listState } = props
  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-1 border-b border-pt-purple border-opacity-50',
        {
          'grid-cols-7': listState !== ListState.edit,
          'grid-cols-8': listState === ListState.edit
        }
      )}
    >
      <span className='col-span-1' />
      <Header>Address</Header>
      <Header>Amount</Header>
      <Tooltip id={`lock-tooltip-header`} tip={'Duration to lock the delegation'}>
        <div className='col-span-2 flex space-x-2 items-center'>
          <span className='uppercase opacity-50 font-bold text-xxxs'>Duration</span>
          <FeatherIcon icon={'help-circle'} className='w-4 h-4 opacity-70' style={{ top: -1 }} />
        </div>
      </Tooltip>
      {listState === ListState.edit && <span className='col-span-1' />}
    </li>
  )
}

const Header = (props) => (
  <span
    {...props}
    className={classNames(props.className, 'col-span-2 uppercase opacity-50 font-bold text-xxxs')}
  />
)

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

  const delegatee = getDelegatee(delegation, delegationCreation, delegationUpdate)

  const balance = getBalance(delegation, delegationFund)
  const duration = getDuration(delegation, delegationCreation, delegationUpdate)
  const currentTimeInSeconds = msToS(Date.now()).toFixed(0)
  const isLocked = delegation?.lockUntil.gt(currentTimeInSeconds) || false
  const isEdited = !!delegationUpdate || !!delegationCreation
  const isZeroBalance = delegation?.balance.isZero()

  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-2 first:border-t border-b border-pt-purple border-opacity-50',
        {
          'grid-cols-7': listState !== ListState.edit,
          'grid-cols-8': listState === ListState.edit,
          'opacity-50 dark:bg-white dark:bg-opacity-5 bg-actually-black bg-opacity-20':
            ((listState === ListState.edit || listState === ListState.withdraw) && isLocked) ||
            (listState === ListState.withdraw && isZeroBalance)
        }
      )}
    >
      <div className='flex space-x-2 col-span-1'>
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
      <DelegateeDisplay chainId={chainId} delegatee={delegatee} className='col-span-2' />
      <BalanceDisplay
        chainId={chainId}
        listState={listState}
        balance={balance}
        className='col-span-2'
      />
      <LockDisplay
        listState={listState}
        duration={duration}
        isEdited={isEdited}
        className='col-span-2'
      />
      {listState === ListState.edit && (
        <div className='flex justify-end space-x-1 col-span-1'>
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

/**
 *
 * @param props
 * @returns
 */
const DelegateeDisplay: React.FC<{ className?: string; chainId: number; delegatee: string }> = ({
  className,
  chainId,
  delegatee
}) => {
  const screenSize = useScreenSize()
  return (
    <BlockExplorerLink className={className} chainId={chainId} address={delegatee} noIcon>
      <span>{shorten({ hash: delegatee, short: screenSize === ScreenSize.xs })}</span>
    </BlockExplorerLink>
  )
}

/**
 *
 * @param props
 * @returns
 */
const BalanceDisplay: React.FC<{
  className?: string
  chainId: number
  balance: BigNumber
  listState: ListState
}> = (props) => {
  const { className, chainId, balance, listState } = props
  const ticket = useTicket(chainId)
  const balanceDisplay = numberWithCommas(balance, { decimals: ticket.decimals })
  return (
    <div
      className={classNames(className, 'flex items-center space-x-1', {
        'opacity-50': balance.isZero() && listState === ListState.readOnly
      })}
    >
      <TokenIcon chainId={chainId} address={ticket.address} sizeClassName='w-4 h-4' />
      <span>{balanceDisplay}</span>
    </div>
  )
}

/**
 * NOTE: Not updating time live. Relies on a rerender when a delegation goes from locked to unlocked.
 * @param props
 */
const LockDisplay: React.FC<{
  className?: string
  duration: number
  listState: ListState
  isEdited: boolean
}> = (props) => {
  const { className, duration, isEdited, listState } = props

  const isLocked = duration > 0

  const getDurationDisplay = () => {
    if (!isLocked) {
      return (
        <span
          className={classNames(className, '', {
            'opacity-50': listState === ListState.readOnly
          })}
        >
          unlocked
        </span>
      )
    }

    let formattedDuration, units
    if (duration >= SECONDS_PER_DAY) {
      formattedDuration = Math.round(sToD(duration))
      units = formattedDuration === 1 ? 'day' : 'days'
    } else if (duration >= SECONDS_PER_HOUR) {
      formattedDuration = Math.round(sToM(duration))
      units = formattedDuration === 1 ? 'minute' : 'minutes'
    } else if (duration > 0) {
      formattedDuration = Math.round(duration)
      units = formattedDuration === 1 ? 'second' : 'seconds'
    }
    return (
      <div className={'flex space-x-1'}>
        <span className='font-bold'>{formattedDuration}</span>
        <span className='opacity-50'>{`${units}`}</span>
        {!isEdited && <span className='opacity-50'>left</span>}
      </div>
    )
  }

  const icon = isLocked ? 'lock' : 'unlock'

  const durationDisplay = getDurationDisplay()
  return (
    <div className={classNames(className, 'flex items-center space-x-1')}>
      <FeatherIcon icon={icon} className='w-3 h-3' />
      {durationDisplay}
    </div>
  )
}

/**
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
      {delegationCreation && <StateChangeIcon icon='plus-circle' tooltipText='Create slot' />}
      {delegationFund && <StateChangeIcon icon='dollar-sign' tooltipText='Fund delegatee' />}
      {delegationUpdate && <StateChangeIcon icon='edit-2' tooltipText='Edit delegatee' />}
      <FeatherIcon icon='edit' className='w-4 h-4 text-highlight-3' />
    </button>
  )
}

const StateChangeIcon: React.FC<{
  icon: string
  tooltipText: string
}> = (props) => {
  const { icon, tooltipText } = props

  return (
    <Tooltip id={`tooltip-edited-icon-${Math.random()}`} tip={tooltipText}>
      <FeatherIcon icon={icon} className='w-4 h-4 text-yellow' />
    </Tooltip>
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
      className={classNames('w-48', className)}
      size={SquareButtonSize.sm}
      onClick={() => {
        setListState(ListState.edit)
        setIsOpen(true)
      }}
      disabled={transactionPending}
    >
      <FeatherIcon icon='plus' className='w-3 h-3 my-auto mr-1' />
      <span>New Delegation</span>
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
