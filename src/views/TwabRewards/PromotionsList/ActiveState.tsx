import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { format } from 'date-fns'
import { sToD, shorten, sToMs, prettyNumber, numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useTokenBalance } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'
import { Tooltip, BlockExplorerLink, TokenIcon } from '@pooltogether/react-components'

import { PromotionsListProps } from '.'
import { Promotion } from '@twabRewards/interfaces'
import { PromotionSummary } from '@twabRewards/PromotionSummary'
import { useAccountsPromotions } from '@twabRewards/hooks/useAccountsPromotions'

export interface ActiveStateProps extends PromotionsListProps {
  currentAccount: string
}

/**
 * @param props
 * @returns
 */
export const ActiveState: React.FC<ActiveStateProps> = (props) => {
  const { chainId, className, currentAccount } = props
  const { data: promotionsData } = useAccountsPromotions(chainId, currentAccount)

  const { promotions } = promotionsData || {}

  return (
    <>
      <div className={classNames(className, 'flex flex-col pb-32')}>
        <ul>
          <ListHeaders />
          {promotions?.map((promotion) => {
            return (
              <PromotionRow
                key={`slot-${promotion.createdAt.toString()}`}
                promotion={promotion}
                chainId={chainId}
              />
            )
          })}
        </ul>
      </div>
    </>
  )
}

const ListHeaders: React.FC = () => {
  const { t } = useTranslation()

  return (
    <li
      className={classNames(
        'flex items-center',
        'px-2 py-1 border-b border-pt-purple border-opacity-50'
      )}
    >
      <Header className='hidden xs:block xs:w-1/2'>{t('duration', 'Duration')}</Header>
      <Header className='xs:w-1/2'>{t('summary', 'Summary')}</Header>
    </li>
  )
}

const Header = (props) => (
  <span {...props} className={classNames(props.className, 'uppercase font-bold text-xxxs')} />
)

interface PromotionRowProps {
  chainId: number
  promotion?: Promotion
}

/**
 * @param props
 * @returns
 */
const PromotionRow: React.FC<PromotionRowProps> = (props) => {
  const { chainId, promotion } = props

  const { token, tokensPerEpoch, startTimestamp, epochDuration, numberOfEpochs } = promotion

  const { t } = useTranslation()

  return (
    <li
      className={classNames(
        'flex items-center',
        'px-2 py-2 first:border-t border-b border-pt-purple border-opacity-50 text-xxs'
      )}
    >
      <div className='flex items-center w-full'>
        <div className='xs:flex items-center w-full'>
          <span className='xs:w-1/2'>
            <StartTimestampDisplay startTimestamp={startTimestamp} />
            <EndTimestampDisplay
              startTimestamp={startTimestamp}
              numberOfEpochs={numberOfEpochs}
              epochDuration={epochDuration}
            />
          </span>
          <span className='xs:w-1/2'>
            <PromotionSummary
              className='mt-2 xs:mt-0'
              hideBackground
              chainId={chainId}
              numberOfEpochs={numberOfEpochs}
              tokensPerEpoch={BigNumber.from(tokensPerEpoch)}
              epochDuration={sToD(epochDuration)}
              token={token}
            />
          </span>
        </div>
        <div className='col-span-1 flex justify-end w-4 xs:w-auto'>
          <Tooltip
            id={`tooltip-edit-promo-${startTimestamp}`}
            tip={t(
              'extendingEndingPromotionsComingSoon',
              'Extending, ending and destroying promotions coming soon'
            )}
          >
            <div className='col-span-2 flex space-x-1 items-center'>
              <FeatherIcon icon={'edit-2'} className='w-4 h-4 opacity-50 text-pt-teal' />
            </div>
          </Tooltip>
        </div>
      </div>
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
}> = ({ startTimestamp }) => {
  const { t } = useTranslation()
  return (
    <span>
      <span className='uppercase font-semibold'>{t('starts')}</span>:{' '}
      {format(new Date(sToMs(startTimestamp)), 'MMM do yyyy')},{' '}
      {format(new Date(sToMs(startTimestamp)), 'p')}
    </span>
  )
}

/**
 *
 * @param props
 * @returns
 */
const EndTimestampDisplay: React.FC<{
  startTimestamp: number
  numberOfEpochs: number
  epochDuration: number
}> = ({ startTimestamp, numberOfEpochs, epochDuration }) => {
  const { t } = useTranslation()

  const duration = numberOfEpochs * epochDuration
  const endTimestamp = Number(startTimestamp) + duration

  return (
    <div>
      <span className='uppercase font-semibold'>{t('ends')}</span>:{' '}
      {format(new Date(sToMs(endTimestamp)), 'MMM do yyyy')},{' '}
      {format(new Date(sToMs(endTimestamp)), 'p')}
    </div>
  )
}

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
