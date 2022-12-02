import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { BlockExplorerLink } from '@pooltogether/wallet-connection'
import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import classNames from 'classnames'

/**
 *
 * @param props
 * @returns
 */
export const PrizeTierHistoryTitle = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
  showLink?: boolean
  className?: string
}) => (
  <div className={classNames('flex gap-2 justify-between font-bold', props.className)}>
    <div className='flex space-x-2 items-center'>
      <NetworkIcon chainId={props.prizeTierHistoryContract.chainId} />
      <span>{getNetworkNiceNameByChainId(props.prizeTierHistoryContract.chainId)}</span>
      <TokenIcon
        address={props.prizeTierHistoryContract.token.address}
        chainId={props.prizeTierHistoryContract.chainId}
      />
      <span>{props.prizeTierHistoryContract.token.symbol}</span>
    </div>
    <div>
      {props.prizeTierHistoryContract.isV2 && <span className='mr-2'>V2</span>}
      {props.showLink && (
        <BlockExplorerLink
          address={props.prizeTierHistoryContract.address}
          chainId={props.prizeTierHistoryContract.chainId}
        >
          <span>{`${props.prizeTierHistoryContract.address.slice(0, 6)}...`}</span>
        </BlockExplorerLink>
      )}
    </div>
  </div>
)
