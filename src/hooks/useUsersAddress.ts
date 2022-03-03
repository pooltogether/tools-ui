import { getPriorityConnector } from '@web3-react/core'
import { CONNECTORS } from '../connectors'

const { usePriorityAccount } = getPriorityConnector(...CONNECTORS)

export const useUsersAddress = () => {
  const usersAddress = usePriorityAccount()
  return usersAddress
}
