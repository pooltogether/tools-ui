import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { msToD, shorten } from '@pooltogether/utilities'
import {
  delegationUpdatesAtom,
  delegationWithdrawalsAtom,
  editDelegationModalOpenAtom,
  removeDelegationWithdrawalAtom,
  addDelegationWithdrawalAtom,
  delegationFundsAtom,
  delegationIdToEditAtom,
  delegationFormDefaultsAtom
} from '@twabDelegator/atoms'
import {
  Delegation,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { DelegationListProps, ListState } from '.'
import {
  CheckboxInputGroup,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { useNextSlot } from '@twabDelegator/hooks/useNextSlot'
import { formatUnits } from 'ethers/lib/utils'
import { useDelegatorsUpdatedTwabDelegations } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegations'
import { CreateDelegationModal } from '@twabDelegator/DelegationList/CreateDelegationModal'
import { useState } from 'react'

export interface ActiveStateProps extends DelegationListProps {
  delegator: string
  listState: ListState
  setListState: (listState: ListState) => void
}

/**
 * TODO: List newly created delegations
 * TODO: Show edits
 * @param props
 * @returns
 */
export const ActiveState: React.FC<ActiveStateProps> = (props) => {
  const { chainId, className, listState, setListState, delegator } = props
  const { data: delegations } = useDelegatorsUpdatedTwabDelegations(chainId, delegator)
  const usersAddress = useUsersAddress()
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  return (
    <>
      <ul className={className}>
        {delegations.map((delegation) => (
          <DelegationRow
            {...delegation}
            key={`${usersAddress}-${twabDelegatorAddress}-slot-${delegation.delegationId.slot.toString()}`}
            chainId={chainId}
            listState={listState}
          />
        ))}
      </ul>
      <AddSlotButton
        className='mx-auto mt-4'
        chainId={chainId}
        delegator={delegator}
        listState={listState}
        setListState={setListState}
      />
    </>
  )
}

interface DelegationRowProps {
  listState: ListState
  chainId: number
  delegationId: DelegationId
  delegation?: Delegation
  delegationUpdate?: DelegationUpdate
  delegationFund?: DelegationFund
}

/**
 *
 * @param props
 * @returns
 */
const DelegationRow: React.FC<DelegationRowProps> = (props) => {
  const { chainId, delegationId, delegation, delegationUpdate, delegationFund, listState } = props
  const { slot } = delegationId

  // TODO: Get token decimals
  const delegatee = delegationUpdate?.delegatee || delegation.delegatee
  const delegateeDisplay = shorten({ hash: delegatee })
  const balance = !!delegationFund?.amount
    ? formatUnits(delegationFund.amount, 6)
    : delegation
    ? formatUnits(delegation.balance, 6)
    : '0'
  // TODO: If unlocked, show that
  // TODO: If duration is set to 2 days, show date it ends
  const duration = delegationUpdate?.lockDuration ? msToD(delegationUpdate.lockDuration) : 0
  const lockDisplay = !!delegationUpdate
    ? `${duration} days`
    : new Date(delegation.lockUntil.mul(1000).toNumber()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

  return (
    <li
      className={classNames('grid items-center', {
        'grid-cols-4': listState === ListState.readOnly,
        'grid-cols-5': listState === ListState.edit || listState === ListState.withdraw
      })}
    >
      {listState === ListState.withdraw && <DelegationWithdrawToggle delegationId={delegationId} />}
      <span>{slot.toString()}</span>
      <span>{delegateeDisplay}</span>
      <span>{balance}</span>
      <span>{lockDisplay}</span>
      {listState === ListState.edit && (
        <span>
          {(delegationUpdate || delegationFund) && <span>e</span>}
          <DelegationEditToggle
            delegationId={delegationId}
            delegatee={delegatee}
            balance={balance}
            duration={duration}
          />
        </span>
      )}
    </li>
  )
}

/**
 * TODO: Disable if locked
 * @param props
 * @returns
 */
const DelegationWithdrawToggle: React.FC<{ delegationId: DelegationId }> = (props) => {
  const { delegationId } = props
  const delegationWithdrawal = useDelegationWithdrawal(delegationId)
  const addDelegationWithdrawal = useUpdateAtom(addDelegationWithdrawalAtom)
  const removeDelegationWithdrawal = useUpdateAtom(removeDelegationWithdrawalAtom)
  const amount = delegationWithdrawal?.amount

  return (
    <CheckboxInputGroup
      checked={amount?.isZero()}
      handleClick={() =>
        amount?.isZero()
          ? removeDelegationWithdrawal(delegationId)
          : addDelegationWithdrawal(delegationId)
      }
    />
  )
}

const DelegationEditToggle: React.FC<{
  delegationId: DelegationId
  delegatee: string
  balance: string
  duration: number
}> = (props) => {
  const { delegationId, delegatee, balance, duration } = props
  const setIsOpen = useUpdateAtom(editDelegationModalOpenAtom)
  const setDelegationFormDefaults = useUpdateAtom(delegationFormDefaultsAtom)
  const setDelegationIdToEdit = useUpdateAtom(delegationIdToEditAtom)

  return (
    <button
      onClick={() => {
        setDelegationIdToEdit(delegationId)
        setDelegationFormDefaults({
          delegatee,
          balance,
          duration
        })
        setIsOpen(true)
      }}
    >
      <FeatherIcon icon='edit' className='w-4 h-4' />
    </button>
  )
}

const AddSlotButton: React.FC<{
  chainId: number
  delegator: string
  listState: ListState
  setListState: (listState: ListState) => void
  className?: string
}> = (props) => {
  const { chainId, delegator, className, listState, setListState } = props
  const [isOpen, setIsOpen] = useState(false)

  if (listState === ListState.withdraw) return null

  return (
    <>
      <SquareButton
        theme={SquareButtonTheme.tealOutline}
        className={classNames(className, 'w-24')}
        size={SquareButtonSize.sm}
        onClick={() => {
          setListState(ListState.edit)
          setIsOpen(true)
        }}
      >
        Add Slot
      </SquareButton>
      <CreateDelegationModal
        chainId={chainId}
        delegator={delegator}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
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
