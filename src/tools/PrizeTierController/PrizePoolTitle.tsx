import { usePrizePoolTokens } from '@pooltogether/hooks'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { BlockExplorerLink } from '@pooltogether/wallet-connection'
import classNames from 'classnames'

/**
 *
 * @param props
 * @returns
 */
export const PrizePoolTitle = (props: {
  prizePool: PrizePool
  showLink?: boolean
  className?: string
}) => (
  <div className={classNames('flex justify-between font-bold', props.className)}>
    <div className='flex space-x-2 items-center'>
      <NetworkIcon chainId={props.prizePool.chainId} />
      <div>{getNetworkNiceNameByChainId(props.prizePool.chainId)}</div>
      <PrizePoolToken prizePool={props.prizePool} />
    </div>
    {props.showLink && (
      <BlockExplorerLink address={props.prizePool.address} chainId={props.prizePool.chainId}>
        <span>{`${props.prizePool.address.slice(0, 6)}...`}</span>
      </BlockExplorerLink>
    )}
  </div>
)

const PrizePoolToken = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data: tokens, isFetched } = usePrizePoolTokens(prizePool)
  return isFetched ? (
    <>
      <TokenIcon address={tokens.token.address} chainId={prizePool.chainId} />
      <div>{tokens.token.symbol}</div>
    </>
  ) : null
}
