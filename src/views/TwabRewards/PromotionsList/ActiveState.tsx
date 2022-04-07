import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { sToD, shorten, msToS, sToM, numberWithCommas } from '@pooltogether/utilities'
import {
  promotionUpdatesAtom,
  promotionWithdrawalsAtom,
  editPromotionModalOpenAtom,
  removePromotionWithdrawalAtom,
  addPromotionWithdrawalAtom,
  promotionFundsAtom,
  promotionIdToEditAtom,
  createPromotionModalOpenAtom,
  promotionCreationsAtom
} from '@twabRewards/atoms'
import { Promotion, PromotionFund, PromotionId, PromotionUpdate } from '@twabRewards/interfaces'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { PromotionListProps, ListState } from '.'
import {
  BlockExplorerLink,
  CheckboxInputGroup,
  SquareButton,
  SquareButtonSize,
  SquareButtonTheme,
  TokenIcon,
  Tooltip
} from '@pooltogether/react-components'
import { useTicket } from '@hooks/v4/useTicket'
import { getDelegatee } from '@twabRewards/utils/getDelegatee'
import { getBalance } from '@twabRewards/utils/getBalance'
import { getDuration } from '@twabRewards/utils/getDuration'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from '@constants/misc'
import { BigNumber } from 'ethers'
import { ScreenSize, useScreenSize } from '@pooltogether/hooks'
import { LockedSvg, UnlockedSvg } from '@components/SvgComponents'
import { useTranslation } from 'react-i18next'
import { useAccountsUpdatedPromotions } from '@twabRewards/hooks/useAccountsUpdatedPromotions'

export interface ActiveStateProps extends PromotionListProps {
  currentAccount: string
  listState: ListState
  transactionPending: boolean
  setListState: (listState: ListState) => void
}

/**
 * @param props
 * @returns
 */
export const ActiveState: React.FC<ActiveStateProps> = (props) => {
  const { chainId, className, listState, setListState, currentAccount, transactionPending } = props
  const { data: promotions } = useAccountsUpdatedPromotions(chainId, currentAccount)
  console.log(promotions)
  return (
    <>
      <div className={classNames(className, 'flex flex-col')}>
        <ul>
          <ListHeaders listState={listState} />
          {promotions.map((promotionData) => {
            const { promotion } = promotionData
            console.log(promotion)
            console.log(promotion.createdAt)
            return (
              <PromotionRow
                key={`slot-${promotion.createdAt.toString()}-${listState}`}
                promotion={promotion}
                chainId={chainId}
                listState={listState}
                transactionPending={transactionPending}
              />
            )
          })}
        </ul>
      </div>
    </>
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
          <Tooltip id={`lock-tooltip-header`} tip={'Duration the promotion is locked for in days'}>
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

interface PromotionRowProps {
  listState: ListState
  chainId: number
  transactionPending: boolean
  // fId: PromotionId
  promotion?: Promotion
  // promotionUpdate?: PromotionUpdate
  // promotionCreation?: PromotionUpdate
  // promotionFund?: PromotionFund
}

/**
 * @param props
 * @returns
 */
const PromotionRow: React.FC<PromotionRowProps> = (props) => {
  const {
    chainId,
    // promotionId,
    promotion,
    // promotionCreation,
    // promotionUpdate,
    // promotionFund,
    listState,
    transactionPending
  } = props
  // const { slot } = promotionId

  const { token, tokensPerEpoch, startTimestamp, epochDuration, numberOfEpochs } = promotion
  console.log({ token, tokensPerEpoch, startTimestamp, epochDuration, numberOfEpochs })
  // const token = '0xface'
  // const tokensPerEpoch = BigNumber.from(10)
  // const startTimestamp = Date.now()
  // const epochDuration = 55
  // const numberOfEpochs = 66
  // const delegatee = getDelegatee(promotion, promotionCreation, promotionUpdate)

  // const balance = getBalance(promotion, promotionFund)
  // const duration = getDuration(promotion, promotionCreation, promotionUpdate)
  // const currentTimeInSeconds = msToS(Date.now()).toFixed(0)
  // const isLocked = promotion?.lockUntil.gt(currentTimeInSeconds) || false
  // const isEdited = !!promotionUpdate || !!promotionCreation
  // const isZeroBalance = promotion?.balance.isZero()

  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-2 first:border-t border-b border-pt-purple border-opacity-50',
        {
          'grid-cols-7': listState !== ListState.edit,
          'grid-cols-8': listState === ListState.edit
          // 'opacity-50 dark:bg-white dark:bg-opacity-5 bg-actually-black bg-opacity-20':
          //   listState === ListState.edit ||
          //   listState === ListState.withdraw ||
          //   (listState === ListState.withdraw && isZeroBalance)
        }
      )}
    >
      <div className='flex space-x-2 col-span-1'>
        {/* {!isLocked && listState === ListState.withdraw && (
          <PromotionWithdrawToggle
            {...props}
            isZeroBalance={isZeroBalance}
            isLocked={isLocked}
            transactionPending={transactionPending}
          />
        )}
        {isLocked && listState === ListState.withdraw && <div style={{ width: 16 }}></div>} */}
        {/* <span className='font-bold opacity-60'>{slot.toString()}</span> */}
        <span>{token}</span>
        <span>{tokensPerEpoch.toString()}</span>
        <span>{startTimestamp.toString()}</span>
        <span>{epochDuration}</span>
        <span>{numberOfEpochs}</span>
      </div>
      {/* <DelegateeDisplay chainId={chainId} delegatee={delegatee} className='col-span-2' />
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
      /> */}
      {/* {!isLocked && listState === ListState.edit && (
        <div className='flex justify-end space-x-1 col-span-1'>
          <PromotionEditToggle
            {...props}
            isZeroBalance={isZeroBalance}
            isLocked={isLocked}
            transactionPending={transactionPending}
          />
        </div>
      )} */}
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
 * NOTE: Not updating time live. Relies on a rerender when a promotion goes from locked to unlocked.
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
const PromotionWithdrawToggle: React.FC<
  PromotionRowProps & {
    isZeroBalance: boolean
    isLocked: boolean
    transactionPending: boolean
  }
> = (props) => {
  const { promotionId, transactionPending, isZeroBalance, isLocked } = props
  const promotionWithdrawal = usePromotionWithdrawal(promotionId)
  const addPromotionWithdrawal = useUpdateAtom(addPromotionWithdrawalAtom)
  const removePromotionWithdrawal = useUpdateAtom(removePromotionWithdrawalAtom)
  const amount = promotionWithdrawal?.amount

  return (
    <CheckboxInputGroup
      disabled={transactionPending || isLocked || isZeroBalance}
      checked={amount?.isZero()}
      handleClick={() =>
        amount?.isZero()
          ? removePromotionWithdrawal(promotionId)
          : addPromotionWithdrawal(promotionId)
      }
    />
  )
}

// Edit a slot. Close modal. Click edit on a different slot. Edits from the first are visible.
const PromotionEditToggle: React.FC<
  PromotionRowProps & {
    isZeroBalance: boolean
    isLocked: boolean
    transactionPending: boolean
  }
> = (props) => {
  const {
    promotionId,
    transactionPending,
    isLocked,
    promotionCreation,
    promotionFund,
    promotionUpdate
  } = props
  const setIsOpen = useUpdateAtom(editPromotionModalOpenAtom)
  const setPromotionIdToEdit = useUpdateAtom(promotionIdToEditAtom)
  const { t } = useTranslation()

  return (
    <button
      className='flex space-x-1'
      onClick={() => {
        setPromotionIdToEdit(promotionId)
        setIsOpen(true)
      }}
      disabled={transactionPending || isLocked}
    >
      {promotionCreation && <StateChangeIcon icon='plus-circle' tooltipText={t('createSlot')} />}
      {promotionFund && <StateChangeIcon icon='dollar-sign' tooltipText={t('fundDelegatee')} />}
      {promotionUpdate && <StateChangeIcon icon='edit-2' tooltipText={t('editDelegatee')} />}
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

/**
 *
 * @param promotionId
 * @returns
 */
export const usePromotionCreation = (promotionId: PromotionId) => {
  const [promotionCreations] = useAtom(promotionCreationsAtom)
  return promotionCreations.find(
    (promotionCreation) =>
      promotionCreation.delegator === promotionId.delegator &&
      promotionCreation.slot.eq(promotionId.slot)
  )
}

/**
 *
 * @param promotionId
 * @returns
 */
export const usePromotionUpdate = (promotionId: PromotionId) => {
  const [promotionUpdates] = useAtom(promotionUpdatesAtom)
  return promotionUpdates.find(
    (promotionUpdate) =>
      promotionUpdate.delegator === promotionId.delegator &&
      promotionUpdate.slot.eq(promotionId.slot)
  )
}

/**
 *
 * @param promotionId
 * @returns
 */
export const usePromotionFund = (promotionId: PromotionId) => {
  const [promotionFunds] = useAtom(promotionFundsAtom)
  return promotionFunds.find(
    (promotionFund) =>
      promotionFund.delegator === promotionId.delegator && promotionFund.slot.eq(promotionId.slot)
  )
}

/**
 *
 * @param promotionId
 * @returns
 */
export const usePromotionWithdrawal = (promotionId: PromotionId) => {
  const [promotionWithdrawals] = useAtom(promotionWithdrawalsAtom)
  return promotionWithdrawals.find(
    (promotionWithdrawal) =>
      promotionWithdrawal.delegator === promotionId.delegator &&
      promotionWithdrawal.slot.eq(promotionId.slot)
  )
}
