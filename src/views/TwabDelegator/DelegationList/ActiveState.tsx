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
  BlockExplorerLink,
  CheckboxInputGroup,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  TokenIcon,
  Tooltip
} from '@pooltogether/react-components'
import { useDelegatorsUpdatedTwabDelegations } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegations'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { getDelegatee } from '@twabDelegator/utils/getDelegatee'
import { getBalance } from '@twabDelegator/utils/getBalance'
import { getDuration } from '@twabDelegator/utils/getDuration'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from '@constants/misc'
import { BigNumber } from 'ethers'
import classNames from 'classnames'
import { ScreenSize, useScreenSize } from '@pooltogether/hooks'
import { LockedSvg, UnlockedSvg } from '@components/SvgComponents'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { usePagination } from '@hooks/usePagination'

export interface ActiveStateProps extends DelegationListProps {
  delegator: string
  listState: ListState
  transactionsPending: boolean
  setListState: (listState: ListState) => void
}

/**
 * @param props
 * @returns
 */
export const ActiveState: React.FC<ActiveStateProps> = (props) => {
  const { chainId, className, listState, setListState, delegator, transactionsPending } = props
  const { data: _delegations } = useDelegatorsUpdatedTwabDelegations(chainId, delegator)
  const { page, pageSize, next, previous, last, first } = usePagination(_delegations?.length, 10, {
    onNext: () => document.getElementById('delegations-title').scrollIntoView(),
    onPrevious: () => document.getElementById('delegations-title').scrollIntoView()
  })

  const delegations = useMemo(() => {
    return _delegations.slice(page * pageSize, page * pageSize + pageSize)
  }, [page, _delegations])

  const { t } = useTranslation()
  const isPaginated = !!previous || !!next

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <ul>
        <ListHeaders listState={listState} />
        {delegations.map((delegation) => (
          <DelegationRow
            {...delegation}
            key={`slot-${delegation.delegationId.slot.toString()}-${listState}-${
              delegation.delegationUpdate?.delegatee ||
              delegation.delegationCreation?.delegatee ||
              delegation.delegation?.delegatee
            }-${delegation.delegationFund?.amount.toString() || delegation.delegation?.balance}`}
            chainId={chainId}
            listState={listState}
            transactionsPending={transactionsPending}
          />
        ))}
      </ul>
      <div
        className={classNames('mt-8 flex', {
          'mx-auto': !isPaginated,
          'w-full': isPaginated
        })}
      >
        {isPaginated && (
          <div className='mr-auto flex space-x-2 items-center'>
            {!!previous && (
              <>
                <button className='' onClick={first}>
                  <FeatherIcon
                    icon='chevrons-left'
                    className='w-4 h-4 stroke-2 text-pt-teal hover:opacity-70 transition'
                  />
                </button>
                <button className='' onClick={previous}>
                  <FeatherIcon
                    icon='chevron-left'
                    className='w-4 h-4 stroke-2 text-pt-teal hover:opacity-70 transition'
                  />
                </button>
              </>
            )}
            <span className='text-xxxs'>{t('pageNumber', { pageNumber: page + 1 })}</span>
            {!!next && (
              <>
                <button className='' onClick={next}>
                  <FeatherIcon
                    icon='chevron-right'
                    className='w-4 h-4 stroke-2 text-pt-teal hover:opacity-70 transition'
                  />
                </button>
                <button className='' onClick={last}>
                  <FeatherIcon
                    icon='chevrons-right'
                    className='w-4 h-4 stroke-2 text-pt-teal hover:opacity-70 transition'
                  />
                </button>
              </>
            )}
          </div>
        )}
        <AddSlotButton
          className='ml-auto'
          chainId={chainId}
          delegator={delegator}
          listState={listState}
          setListState={setListState}
          transactionsPending={transactionsPending}
        />
      </div>
    </div>
  )
}

const ListHeaders: React.FC<{ listState: ListState }> = (props) => {
  const { listState } = props
  const { t } = useTranslation()

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
      <Header>{t('address')}</Header>
      <Header>{t('amount')}</Header>
      <Header className='flex items-center'>
        <span>{t('duration')}</span>
        <span className='normal-case'>
          <Tooltip id={`lock-tooltip-header`} tip={'Duration the delegation is locked for in days'}>
            <FeatherIcon
              icon={'help-circle'}
              className='w-3 h-3 ml-1 opacity-50'
              style={{ top: -1 }}
            />
          </Tooltip>
        </span>
      </Header>

      {listState === ListState.edit && <span className='col-span-1' />}
    </li>
  )
}

const Header = (props) => (
  <span
    {...props}
    className={classNames(props.className, 'col-span-2 uppercase font-bold text-xxxs')}
  />
)

interface DelegationRowProps {
  listState: ListState
  chainId: number
  transactionsPending: boolean
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
    transactionsPending
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
        {!isLocked && listState === ListState.withdraw && (
          <DelegationWithdrawToggle
            {...props}
            isZeroBalance={isZeroBalance}
            isLocked={isLocked}
            transactionsPending={transactionsPending}
          />
        )}
        {isLocked && listState === ListState.withdraw && <div style={{ width: 16 }}></div>}
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
      {!isLocked && listState === ListState.edit && (
        <div className='flex justify-end space-x-1 col-span-1'>
          <DelegationEditToggle
            {...props}
            isZeroBalance={isZeroBalance}
            isLocked={isLocked}
            transactionsPending={transactionsPending}
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
  const ticket = useV4Ticket(chainId)
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
  const { t } = useTranslation()

  const isLocked = duration > 0

  const getDurationDisplay = () => {
    if (!isLocked) {
      return (
        <span
          className={classNames(className, 'hidden xs:inline-block lowercase', {
            'opacity-50': listState === ListState.readOnly
          })}
        >
          {t('unlocked')}
        </span>
      )
    }

    let formattedDuration, units
    if (duration >= SECONDS_PER_DAY) {
      formattedDuration = Math.round(sToD(duration))
      units = t('lowercaseDay', { count: formattedDuration })
    } else if (duration >= SECONDS_PER_HOUR) {
      formattedDuration = Math.round(sToM(duration))
      units = t('lowercaseMinute', { count: formattedDuration })
    } else if (duration > 0) {
      formattedDuration = Math.round(duration)
      units = t('lowercaseSecond', { count: formattedDuration })
    }
    return (
      <div className={'flex space-x-1'}>
        <span className='font-bold'>{formattedDuration}</span>
        <span className='opacity-50'>{`${units}`}</span>
        {!isEdited && <span className='opacity-50 hidden xs:inline-block'>{t('left')}</span>}
      </div>
    )
  }

  const icon = isLocked ? <LockedSvg /> : <UnlockedSvg />

  const durationDisplay = getDurationDisplay()
  return (
    <div className={classNames(className, 'flex items-center space-x-1')}>
      <div className='opacity-30 w-4 h-4'>{icon}</div>
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
    transactionsPending: boolean
  }
> = (props) => {
  const { delegationId, transactionsPending, isZeroBalance, isLocked } = props
  const delegationWithdrawal = useDelegationWithdrawal(delegationId)
  const addDelegationWithdrawal = useUpdateAtom(addDelegationWithdrawalAtom)
  const removeDelegationWithdrawal = useUpdateAtom(removeDelegationWithdrawalAtom)
  const amount = delegationWithdrawal?.amount

  return (
    <CheckboxInputGroup
      disabled={transactionsPending || isLocked || isZeroBalance}
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
    transactionsPending: boolean
  }
> = (props) => {
  const {
    delegationId,
    transactionsPending,
    isLocked,
    delegationCreation,
    delegationFund,
    delegationUpdate
  } = props
  const setIsOpen = useUpdateAtom(editDelegationModalOpenAtom)
  const setDelegationIdToEdit = useUpdateAtom(delegationIdToEditAtom)
  const { t } = useTranslation()

  return (
    <button
      className='flex space-x-1'
      onClick={() => {
        setDelegationIdToEdit(delegationId)
        setIsOpen(true)
      }}
      disabled={transactionsPending || isLocked}
    >
      {delegationCreation && <StateChangeIcon icon='plus-circle' tooltipText={t('createSlot')} />}
      {delegationFund && <StateChangeIcon icon='dollar-sign' tooltipText={t('fundDelegatee')} />}
      {delegationUpdate && <StateChangeIcon icon='edit-2' tooltipText={t('editDelegatee')} />}
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
  transactionsPending: boolean
  className?: string
}> = (props) => {
  const { className, listState, transactionsPending, delegator, setListState } = props
  const usersAddress = useUsersAddress()
  const setIsOpen = useUpdateAtom(createDelegationModalOpenAtom)
  const { t } = useTranslation()

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
      disabled={transactionsPending}
    >
      <FeatherIcon icon='plus-circle' className='w-4 h-4 my-auto mr-1' />
      <span>{t('newDelegation')}</span>
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
