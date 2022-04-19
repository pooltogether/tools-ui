import classNames from 'classnames'
import { format } from 'date-fns'
import { shorten, sToMs, prettyNumber, numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useTokenBalance } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'
import { BlockExplorerLink, TokenIcon } from '@pooltogether/react-components'

import { PromotionsListProps, ListState } from '.'
import { Promotion } from '@twabRewards/interfaces'
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

const ListHeaders: React.FC<{}> = () => {
  const { t } = useTranslation()

  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-1 border-b border-pt-purple border-opacity-50 grid-cols-8'
      )}
    >
      <Header className='col-span-2'>
        <span>{t('starts', 'Starts')}</span>
      </Header>
      <Header>{t('token')}</Header>
      <Header className='col-span-2 text-center'>{t('tokensPerEpoch', 'Tokens per epoch')}</Header>
      <Header className='col-span-2 text-center'>
        {t('epochDuration', 'Epoch duration')} ({t('days')})
      </Header>
      <Header className='text-center'>{t('epochs', 'Epochs')}</Header>
    </li>
  )
}

const Header = (props) => (
  <span {...props} className={classNames(props.className, 'uppercase font-bold text-xxxs')} />
)

interface PromotionRowProps {
  chainId: number
  currentAccount: string
  promotion?: Promotion
}

/**
 * @param props
 * @returns
 */
const PromotionRow: React.FC<PromotionRowProps> = (props) => {
  const { chainId, currentAccount, promotion } = props

  const { token, tokensPerEpoch, startTimestamp, epochDuration, numberOfEpochs } = promotion

  return (
    <li
      className={classNames(
        'grid items-center',
        'px-2 py-2 first:border-t border-b border-pt-purple border-opacity-50 grid-cols-8 text-xxs'
      )}
    >
      <StartTimestampDisplay startTimestamp={startTimestamp} />
      <TokenDisplay chainId={chainId} token={token} />
      <TokensPerEpochDisplay
        chainId={chainId}
        account={currentAccount}
        token={token}
        tokensPerEpoch={tokensPerEpoch}
      />
      <EpochDurationDisplay epochDuration={epochDuration} />
      <NumberOfEpochsDisplay numberOfEpochs={numberOfEpochs} />
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
  <span className='col-span-2'>
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
