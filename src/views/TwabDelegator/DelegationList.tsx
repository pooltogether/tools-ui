import { useUsersAddress } from '@hooks/useUsersAddress'
import FeatherIcon from 'feather-icons-react'
import {
  CheckboxInputGroup,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { shorten } from '@pooltogether/utilities'
import { useUsersTwabDelegations } from '@twabDelegator/hooks/useUsersTwabDelegations'
import { Delegation } from '@twabDelegator/interfaces'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import classNames from 'classnames'
import { atom, useAtom } from 'jotai'
import { useState } from 'react'
import { UseQueryResult } from 'react-query'
import {
  delegationEditsCountAtom,
  delegationUpdatesAtom,
  delegationWithdrawlsCountAtom,
  removeWithdrawFromSlotAtom,
  withdrawFromSlotAtom
} from '@twabDelegator/atoms'

interface DelegationListProps {
  className?: string
  chainId: number
}

enum ListState {
  readOnly = 'READ_ONLY',
  edit = 'EDIT',
  withdraw = 'WITHDRAW'
}

/**
 *
 * @param slotIndex
 * @returns
 */
const useDelegationUpdates = (slotIndex: string) => {
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  return delegationUpdates[slotIndex]
}

/**
 *
 * @returns
 */
export const DelegationList: React.FC<DelegationListProps> = (props) => {
  const { chainId } = props
  const usersAddress = useUsersAddress()
  const useQueryResult = useUsersTwabDelegations(chainId, usersAddress)
  const [listState, setListState] = useState<ListState>(ListState.readOnly)

  const { data, isFetched } = useQueryResult

  if (isFetched) {
    let list
    const slotIndices = Object.keys(data)
    if (slotIndices.length === 0) {
      list = (
        <EmptyState
          {...useQueryResult}
          {...props}
          listState={listState}
          setListState={setListState}
        />
      )
    } else {
      list = (
        <ActiveState
          {...useQueryResult}
          {...props}
          listState={listState}
          setListState={setListState}
        />
      )
    }
    return (
      <>
        {list}
        <ListStateActions listState={listState} setListState={setListState} />
      </>
    )
  } else {
    return <LoadingState {...props} />
  }
}

/**
 *
 * @param props
 * @returns
 */
const LoadingState: React.FC<DelegationListProps> = (props) => {
  const { className } = props
  return <div className={className}>Loading...</div>
}

interface DelegationListViewProps extends DelegationListProps {
  listState: ListState
  setListState: (listState: ListState) => void
}

/**
 *
 * @param props
 * @returns
 */
const EmptyState: React.FC<
  DelegationListViewProps & UseQueryResult<{ [slotIndex: string]: Delegation }>
> = (props) => {
  const { className } = props
  return <div className={className}>Create a delegation</div>
}

/**
 *
 * @param props
 * @returns
 */
const ActiveState: React.FC<
  DelegationListViewProps & UseQueryResult<{ [slotIndex: string]: Delegation }>
> = (props) => {
  const { data: delegations, chainId, className, listState } = props
  const usersAddress = useUsersAddress()
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const slotIndices = Object.keys(delegations)
  return (
    <ul className={className}>
      {slotIndices.map((slotIndex) => (
        <DelegationRow
          key={`${usersAddress}-${twabDelegatorAddress}-slot-${slotIndex}`}
          chainId={chainId}
          slotIndex={slotIndex}
          delegation={delegations[slotIndex]}
          listState={listState}
        />
      ))}
    </ul>
  )
}

interface DelegationRowProps {
  slotIndex: string
  chainId: number
  delegation: Delegation
  listState: ListState
}

/**
 *
 * @param props
 * @returns
 */
const DelegationRow: React.FC<DelegationRowProps> = (props) => {
  const { chainId, delegation, slotIndex, listState } = props
  const { delegatee, balance, lockUntil } = delegation
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)

  return (
    <li
      className={classNames('grid items-center', {
        'grid-cols-4': listState === ListState.readOnly,
        'grid-cols-5': listState === ListState.edit || listState === ListState.withdraw
      })}
    >
      {listState === ListState.withdraw && <DelegationWithdrawToggle slotIndex={slotIndex} />}
      <span>{slotIndex}</span>
      <span>{shorten({ hash: delegatee })}</span>
      <span>{balance.toString()}</span>
      <span>{lockUntil.toString()}</span>
      {listState === ListState.edit && <FeatherIcon icon='edit' className='w-4 h-4' />}
    </li>
  )
}

/**
 *
 * @param props
 * @returns
 */
const DelegationWithdrawToggle: React.FC<{ slotIndex: string }> = (props) => {
  const { slotIndex } = props
  // const delegationUpdate = useDelegationUpdates(slotIndex)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const delegationUpdate = delegationUpdates[slotIndex]
  const [, withdrawFromSlot] = useAtom(withdrawFromSlotAtom)
  const [, removeWithdrawFromSlot] = useAtom(removeWithdrawFromSlotAtom)
  const balance = delegationUpdate?.balance

  console.log({ delegationUpdate, slotIndex })
  return (
    <CheckboxInputGroup
      checked={balance?.isZero()}
      handleClick={() =>
        balance?.isZero() ? removeWithdrawFromSlot(slotIndex) : withdrawFromSlot(slotIndex)
      }
    />
  )
}

interface ListStateActionsProps {
  listState: ListState
  setListState: (listState: ListState) => void
}

const ListStateActions: React.FC<ListStateActionsProps> = (props) => {
  const { listState, setListState } = props
  const [editsCount] = useAtom(delegationEditsCountAtom)
  const [withdrawlsCount] = useAtom(delegationWithdrawlsCountAtom)

  if (listState === ListState.edit) {
    return (
      <div className='flex justify-between space-x-2'>
        <SquareButton
          className='w-24'
          size={SquareButtonSize.sm}
          onClick={() => setListState(ListState.readOnly)}
          theme={SquareButtonTheme.tealOutline}
        >
          Cancel
        </SquareButton>
        <span>edits: {editsCount}</span>
      </div>
    )
  } else if (listState === ListState.withdraw) {
    return (
      <div className='flex justify-between space-x-2'>
        <SquareButton
          className='w-24'
          size={SquareButtonSize.sm}
          onClick={() => setListState(ListState.readOnly)}
          theme={SquareButtonTheme.tealOutline}
        >
          Cancel
        </SquareButton>
        <span>withdrawals: {withdrawlsCount}</span>
      </div>
    )
  }

  return (
    <div className='flex justify-end space-x-2'>
      <SquareButton
        className='w-24'
        size={SquareButtonSize.sm}
        onClick={() => setListState(ListState.withdraw)}
      >
        Withdraw
      </SquareButton>
      <SquareButton
        className='w-24'
        size={SquareButtonSize.sm}
        onClick={() => setListState(ListState.edit)}
      >
        Edit
      </SquareButton>
    </div>
  )
}
