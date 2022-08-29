import { BlockExplorerLink, NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { AccountAvatar, useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { constants } from 'ethers'
import { useTranslation } from 'react-i18next'
import { getAirdropClaimChainId } from './utils/getAirdropClaimChainId'

export const AirdropClaimSettings: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const chainId = getAirdropClaimChainId()

  return (
    <div
      className={classNames(
        className,
        'flex items-center bg-white dark:bg-pt-purple-dark rounded-full py-2 px-4'
      )}
    >
      <div className='w-full flex justify-between'>
        <div className='flex space-x-2 items-center'>
          <AccountAvatar sizeClassName='w-4 h-4' address={usersAddress || constants.AddressZero} />
          <BlockExplorerLink
            chainId={chainId}
            address={usersAddress || constants.AddressZero}
            shorten
            noIcon
          />
        </div>
        <div className='flex space-x-1 items-center'>
          <NetworkIcon chainId={chainId} className='mr-2' sizeClassName='w-4 h-4' />
          <span className='capitalize leading-none tracking-wider text-xs'>
            {getNetworkNiceNameByChainId(chainId)}
          </span>
        </div>
      </div>
    </div>
  )
}

const LiquidatorNetworkSelection = () => {}
