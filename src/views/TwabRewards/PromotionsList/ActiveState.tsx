import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { format } from 'date-fns'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { sToD, shorten, sToMs, sToM, prettyNumber, numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { ScreenSize, useScreenSize, useTokenBalance } from '@pooltogether/hooks'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'react-i18next'

import {
  // promotionUpdatesAtom,
  // promotionWithdrawalsAtom,
  editPromotionModalOpenAtom,
  // removePromotionWithdrawalAtom,
  // addPromotionWithdrawalAtom,
  // promotionFundsAtom,
  promotionIdToEditAtom,
  createPromotionModalOpenAtom
  // promotionCreationsAtom
} from '@twabRewards/atoms'
import { Promotion, PromotionFund, PromotionId, PromotionUpdate } from '@twabRewards/interfaces'
import { PromotionsListProps, ListState } from '.'
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
// import { getDelegatee } from '@twabRewards/utils/getDelegatee'
// import { getBalance } from '@twabRewards/utils/getBalance'
// import { getDuration } from '@twabRewards/utils/getDuration'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from '@constants/misc'

import { LockedSvg, UnlockedSvg } from '@components/SvgComponents'
import { useAccountsPromotions } from '@twabRewards/hooks/useAccountsPromotions'

export interface ActiveStateProps extends PromotionsListProps {
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
  const { data: promotionsData } = useAccountsPromotions(chainId, currentAccount)

  const { promotions } = promotionsData

  return (
    <>
      <div className={classNames(className, 'flex flex-col')}>
        <ul>
          <ListHeaders listState={listState} />
          {promotions.map((promotion) => {
            return (
              <PromotionRow
                key={`slot-${promotion.createdAt.toString()}-${listState}`}
                currentAccount={currentAccount}
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
        'px-2 py-1 border-b border-pt-purple border-opacity-50 grid-cols-8'
      )}
    >
      <Header>{t('token')}</Header>
      <Header className='col-span-2 text-center'>{t('tokensPerEpoch', 'Tokens per epoch')}</Header>
      <Header className='col-span-2 text-center'>
        <span>{t('startsAt', 'Starts at')}</span>
        {/* <span className='normal-case'>
          <Tooltip id={`lock-tooltip-header`} tip={'Duration the promotion is locked for in days'}>
            <FeatherIcon
              icon={'help-circle'}
              className='w-3 h-3 ml-1 opacity-50'
              style={{ top: -1 }}
            />
          </Tooltip>
        </span> */}
      </Header>
      <Header className='col-span-2 text-center'>
        {t('epochDuration', 'Epoch duration')} ({t('days')})
      </Header>
      <Header className='text-center'>{t('epochs', 'Epochs')}</Header>

      {/* {listState === ListState.edit && <span className='col-span-1' />} */}
    </li>
  )
}

const Header = (props) => (
  <span {...props} className={classNames(props.className, 'uppercase font-bold text-xxxs')} />
)

interface PromotionRowProps {
  listState: ListState
  chainId: number
  currentAccount: string
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
    currentAccount,
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
  // const isLocked = promotion?.lockUntil.gt(currentTimeInSeconds) || false
  // const isEdited = !!promotionUpdate || !!promotionCreation
  // const isZeroBalance = promotion?.balance.isZero()

  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-2 first:border-t border-b border-pt-purple border-opacity-50 grid-cols-8 text-xxs'
      )}
    >
      <TokenDisplay chainId={chainId} token={token} />
      <TokensPerEpochDisplay
        chainId={chainId}
        account={currentAccount}
        token={token}
        tokensPerEpoch={tokensPerEpoch}
      />
      <StartTimestampDisplay startTimestamp={startTimestamp} />
      <EpochDurationDisplay epochDuration={epochDuration} />
      <NumberOfEpochsDisplay numberOfEpochs={numberOfEpochs} />
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
const TokenDisplay: React.FC<{ className?: string; chainId: number; token: string }> = ({
  className,
  chainId,
  token
}) => {
  return (
    <BlockExplorerLink
      className={classNames(className, 'flex items-center')}
      chainId={chainId}
      address={token}
      noIcon
    >
      <TokenIcon sizeClassName='w-4 h-4' className='mr-2' chainId={chainId} address={token} />
      <span>{shorten({ hash: token, short: true })}</span>
    </BlockExplorerLink>
  )
}

/**
 *
 * @param props
 * @returns
 */
const TokensPerEpochDisplay: React.FC<{
  chainId: number
  account: string
  token: string
  tokensPerEpoch: BigNumber
}> = ({ chainId, account, token, tokensPerEpoch }) => {
  const queryResult = useTokenBalance(chainId, account, token)
  if (!queryResult.isFetched || !queryResult.data) {
    return null
  }

  const { decimals } = queryResult.data
  return (
    <span className='text-center col-span-2'>
      {prettyNumber(BigNumber.from(tokensPerEpoch), decimals)}
    </span>
  )
}

/**
 *
 * @param props
 * @returns
 */
const StartTimestampDisplay: React.FC<{
  startTimestamp: number
}> = ({ startTimestamp }) => (
  <span className='col-span-2 text-center'>
    {format(new Date(sToMs(startTimestamp)), 'MMM do yyyy')},
    <br />
    {format(new Date(sToMs(startTimestamp)), 'p')}
  </span>
)

/**
 *
 * @param props
 * @returns
 */
const EpochDurationDisplay: React.FC<{
  epochDuration: number
}> = ({ epochDuration }) => {
  const secondsToDays = (seconds) => seconds / 86400

  return (
    <span className='col-span-2 text-center'>{numberWithCommas(secondsToDays(epochDuration))}</span>
  )
}

/**
 *
 * @param props
 * @returns
 */
const NumberOfEpochsDisplay: React.FC<{
  numberOfEpochs: number
}> = ({ numberOfEpochs }) => <span className='text-center'>{numberOfEpochs}</span>

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
// const PromotionWithdrawToggle: React.FC<
//   PromotionRowProps & {
//     isZeroBalance: boolean
//     isLocked: boolean
//     transactionPending: boolean
//   }
// > = (props) => {
//   const { promotionId, transactionPending, isZeroBalance, isLocked } = props
//   const promotionWithdrawal = usePromotionWithdrawal(promotionId)
//   const addPromotionWithdrawal = useUpdateAtom(addPromotionWithdrawalAtom)
//   const removePromotionWithdrawal = useUpdateAtom(removePromotionWithdrawalAtom)
//   const amount = promotionWithdrawal?.amount

//   return (
//     <CheckboxInputGroup
//       disabled={transactionPending || isLocked || isZeroBalance}
//       checked={amount?.isZero()}
//       handleClick={() =>
//         amount?.isZero()
//           ? removePromotionWithdrawal(promotionId)
//           : addPromotionWithdrawal(promotionId)
//       }
//     />
//   )
// }

// // Edit a slot. Close modal. Click edit on a different slot. Edits from the first are visible.
// const PromotionEditToggle: React.FC<
//   PromotionRowProps & {
//     isZeroBalance: boolean
//     isLocked: boolean
//     transactionPending: boolean
//   }
// > = (props) => {
//   const {
//     promotionId,
//     transactionPending,
//     isLocked,
//     promotionCreation,
//     promotionFund,
//     promotionUpdate
//   } = props
//   const setIsOpen = useUpdateAtom(editPromotionModalOpenAtom)
//   const setPromotionIdToEdit = useUpdateAtom(promotionIdToEditAtom)
//   const { t } = useTranslation()

//   return (
//     <button
//       className='flex space-x-1'
//       onClick={() => {
//         setPromotionIdToEdit(promotionId)
//         setIsOpen(true)
//       }}
//       disabled={transactionPending || isLocked}
//     >
//       {promotionCreation && <StateChangeIcon icon='plus-circle' tooltipText={t('createSlot')} />}
//       {promotionFund && <StateChangeIcon icon='dollar-sign' tooltipText={t('fundDelegatee')} />}
//       {promotionUpdate && <StateChangeIcon icon='edit-2' tooltipText={t('editDelegatee')} />}
//       <FeatherIcon icon='edit' className='w-4 h-4 text-highlight-3' />
//     </button>
//   )
// }

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
// export const usePromotionCreation = (promotionId: PromotionId) => {
//   const [promotionCreations] = useAtom(promotionCreationsAtom)
//   return promotionCreations.find(
//     (promotionCreation) =>
//       promotionCreation.delegator === promotionId.delegator &&
//       promotionCreation.slot.eq(promotionId.slot)
//   )
// }

/**
 *
 * @param promotionId
 * @returns
 */
// export const usePromotionUpdate = (promotionId: PromotionId) => {
//   const [promotionUpdates] = useAtom(promotionUpdatesAtom)
//   return promotionUpdates.find(
//     (promotionUpdate) =>
//       promotionUpdate.delegator === promotionId.delegator &&
//       promotionUpdate.slot.eq(promotionId.slot)
//   )
// }

/**
 *
 * @param promotionId
 * @returns
 */
// export const usePromotionFund = (promotionId: PromotionId) => {
//   const [promotionFunds] = useAtom(promotionFundsAtom)
//   return promotionFunds.find(
//     (promotionFund) =>
//       promotionFund.delegator === promotionId.delegator && promotionFund.slot.eq(promotionId.slot)
//   )
// }

/**
 *
 * @param promotionId
 * @returns
 */
// export const usePromotionWithdrawal = (promotionId: PromotionId) => {
//   const [promotionWithdrawals] = useAtom(promotionWithdrawalsAtom)
//   return promotionWithdrawals.find(
//     (promotionWithdrawal) =>
//       promotionWithdrawal.delegator === promotionId.delegator &&
//       promotionWithdrawal.slot.eq(promotionId.slot)
//   )
// }
