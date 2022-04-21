import { TokenIcon } from '@pooltogether/react-components'
import classNames from 'classNames'

export const TokenDisplay = (props) => {
  const { chainId, tokenData, className } = props

  if (!tokenData) {
    return null
  }

  return (
    <div className={classNames(className, 'inline-flex items-center dark:text-white text-xxs')}>
      {tokenData?.address && (
        <TokenIcon
          sizeClassName='w-4 h-4'
          className='mr-2'
          chainId={chainId}
          address={tokenData?.address}
        />
      )}
      <span className='mr-1'>{tokenData?.name}</span>
    </div>
  )
}
