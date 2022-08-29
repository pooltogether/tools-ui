import { sToD } from '@pooltogether/utilities'
import {
  Delegation,
  DelegationFormValues,
  DelegationFund,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { formatUnits } from 'ethers/lib/utils'
import { getBalance } from './getBalance'
import { getDelegatee } from './getDelegatee'

export const getDelegationFormDefaults = (
  decimals: string,
  delegation?: Delegation,
  delegationCreation?: DelegationUpdate,
  delegationUpdate?: DelegationUpdate,
  delegationFund?: DelegationFund
): DelegationFormValues => {
  const getFormBalance = () => {
    const balanceUnformatted = getBalance(delegation, delegationFund)
    return formatUnits(balanceUnformatted, decimals)
  }

  const getFormDuration = () => {
    if (delegationCreation) return sToD(delegationCreation.lockDuration)
    if (delegationUpdate) return sToD(delegationUpdate.lockDuration)
    return 0
  }

  return {
    delegatee: getDelegatee(delegation, delegationCreation, delegationUpdate),
    balance: getFormBalance(),
    duration: getFormDuration()
  }
}
