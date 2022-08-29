import { TokenIcon } from '@pooltogether/react-components'

export const TokenSymbolAndIcon: React.FC<{ chainId: number; address: string; symbol: string }> = (
  props
) => {
  const { address, chainId, symbol } = props
  return (
    <div className='flex items-center space-x-2'>
      <span className='font-bold'>{symbol}</span>
      <TokenIcon chainId={chainId} address={address} sizeClassName='w-4 h-4' />
    </div>
  )
}
