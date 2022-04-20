import { TokenIcon } from '@pooltogether/react-components'

export const TokenDisplay = (props) => {
  const { chainId, tokenData } = props
  if (!tokenData) {
    return null
  }
  return (
    <div className='inline-flex items-center dark:text-white'>
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
