import { ToolNetworkSelectionTrigger } from '@components/ToolNetworkSelectionTrigger'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { BlockExplorerLink } from '@pooltogether/react-components'
import { AccountAvatar, useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { constants } from 'ethers'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { testnetFaucetChainIdAtom } from './atoms'
import { FAUCET_SUPPORTED_CHAIN_IDS } from './config'
import { getTestnetFaucetChainIds } from './utils/getTestnetFaucetChainIds'

export const TokenFaucetSettings: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [chainId, setChainId] = useAtom(testnetFaucetChainIdAtom)
  const usersAddress = useUsersAddress()
  const chainIds = getTestnetFaucetChainIds()

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
          description={'Select a network to get ticket tokens on'}
          label='select-token-faucet-network-modal'
        />
      </div>
    </div>
  )
}

const LiquidatorNetworkSelection = () => {}
