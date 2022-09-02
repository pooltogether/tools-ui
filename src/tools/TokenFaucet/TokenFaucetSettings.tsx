import { ToolNetworkSelectionTrigger } from '@components/ToolNetworkSelectionTrigger'
import { BlockExplorerLink } from '@pooltogether/react-components'
import { AccountAvatar, useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { constants } from 'ethers'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { tokenFaucetChainIdAtom } from './atoms'
import { getTokenFaucetSupportedChainIds } from './utils/getTokenFaucetSupportedChainIds'

export const TokenFaucetSettings: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [chainId, setChainId] = useAtom(tokenFaucetChainIdAtom)
  const usersAddress = useUsersAddress()
  const chainIds = getTokenFaucetSupportedChainIds()
  const { t } = useTranslation()

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
        <ToolNetworkSelectionTrigger
          currentChainId={chainId}
          supportedChainIds={chainIds}
          setChainId={setChainId}
          description={'Select a network to liquidate prize tokens on'}
          label='select-liquidator-network-modal'
        />
      </div>
    </div>
  )
}

const LiquidatorNetworkSelection = () => {}
