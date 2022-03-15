import FeatherIcon from 'feather-icons-react'
import { SelectNetworkModal } from '@components/SelectNetworkModal'
import { useTicket } from '@hooks/v4/useTicket'
import { useUsersAddress } from '@hooks/wallet/useUsersAddress'
import { useTokenBalance } from '@pooltogether/hooks'
import {
  BlockExplorerLink,
  NetworkIcon,
  ThemedClipSpinner,
  TokenIcon
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import classNames from 'classnames'
import { useState } from 'react'
import { useDelegationSupportedChainIds } from './hooks/useDelegationSupportedChainIds'
import { getTwabDelegatorContractAddress } from './utils/getTwabDelegatorContractAddress'

interface UsersDelegationStateProps {
  className?: string
  chainId: number
  delegator: string
  setChainId: (chainId: number) => void
}

export const UsersDelegationState: React.FC<UsersDelegationStateProps> = (props) => {
  const { className, chainId, setChainId, delegator } = props
  const ticket = useTicket(chainId)
  const twabDelegator = getTwabDelegatorContractAddress(chainId)
  const { data: ticketBalance, isFetched: isTicketBalanceFetched } = useTokenBalance(
    chainId,
    delegator,
    ticket.address
  )
  const { data: delegationBalance, isFetched: isDelegationBalanceFetched } = useTokenBalance(
    chainId,
    delegator,
    twabDelegator
  )

  return (
    <div className={classNames(className, 'flex justify-between')}>
      <div className='flex flex-col'>
        <BlockExplorerLink chainId={chainId} address={delegator} shorten noIcon />
        <div className='flex space-x-2 items-center'>
          <TokenIcon chainId={chainId} address={ticket.address} sizeClassName='w-4 h-4' />
          <span className='opacity-60'>{ticket.symbol}</span>
          <a className='text-pt-teal hover:opacity-70 transition underline text-xxxs flex space-x-1 items-center'>
            <span>{`Get ${ticket.symbol}`}</span>
            <FeatherIcon icon='external-link' className='w-3 h-3' />
          </a>
        </div>
        {delegator && (
          <div className='flex space-x-4 items-center'>
            {(!isDelegationBalanceFetched || !isDelegationBalanceFetched) && (
              <ThemedClipSpinner sizeClassName='w-3 h-3' />
            )}
            {isDelegationBalanceFetched && (
              <div className='flex space-x-1 items-center'>
                <FeatherIcon icon='gift' className='w-3 h-3 text-pt-teal' />
                <span className='opacity-60 text-xxs'>{`${delegationBalance.amountPretty} delegated`}</span>
              </div>
            )}
            {isTicketBalanceFetched && (
              <div className='flex space-x-1 items-center'>
                <FeatherIcon icon='credit-card' className='w-3 h-3 text-pt-teal' />
                <span className='opacity-60 text-xxs'>{`${ticketBalance.amountPretty} balance`}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <DelegationNetworkSelection chainId={chainId} setChainId={setChainId} />
    </div>
  )
}

const DelegationNetworkSelection: React.FC<{
  chainId: number
  setChainId: (chainId: number) => void
}> = (props) => {
  const { chainId, setChainId } = props
  const [isOpen, setIsOpen] = useState(false)
  const chainIds = useDelegationSupportedChainIds()

  return (
    <>
      <button onClick={() => setIsOpen(true)} className='flex transition hover:opacity-70'>
        <NetworkIcon chainId={chainId} className='mr-2' sizeClassName='w-5 h-5' />
        <div className='flex flex-col items-start'>
          <span className='capitalize leading-none tracking-wider text-lg'>
            {getNetworkNiceNameByChainId(chainId)}
          </span>
          <span className='text-pt-teal text-xxxs'>change network</span>
        </div>
      </button>
      <SelectNetworkModal
        label='select-delegation-modal'
        isOpen={isOpen}
        description={'Select a network to manage delegations on'}
        selectedChainId={chainId}
        chainIds={chainIds}
        setSelectedChainId={setChainId}
        setIsOpen={setIsOpen}
      />
    </>
  )
}
