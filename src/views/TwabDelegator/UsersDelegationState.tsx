import { useUsersAddress } from '@hooks/useUsersAddress'
import { NetworkIcon } from '@pooltogether/react-components'
import { shorten } from '@pooltogether/utilities'

interface UsersDelegationStateProps {
  chainId: number
  setChainId: (chainId: number) => void
}

export const UsersDelegationState: React.FC<UsersDelegationStateProps> = (props) => {
  const { chainId } = props
  const usersAddress = useUsersAddress()
  return (
    <div className='flex justify-between'>
      <div>
        <span>{shorten({ hash: usersAddress })}</span>
      </div>
      <div>
        <NetworkIcon chainId={chainId} />
      </div>
    </div>
  )
}
