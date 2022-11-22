import { useTokenAllowance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { Promotion } from '@twabRewards/interfaces'
import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'
import { BigNumber } from 'ethers'

/**
 *
 * @param chainId
 * @param params Promotion
 * @returns object
 */
export const useTwabRewardsTokenAllowance = (chainId: number, params: Promotion) => {
  const usersAddress = useUsersAddress()
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)
  const {
    data: allowance,
    isFetched: isAllowanceFetched,
    refetch: twabRewardsAllowanceRefetch
  } = useTokenAllowance(chainId, usersAddress, twabRewardsAddress, params?.token)
  const totalAmountToFund = !!params?.tokensPerEpoch
    ? BigNumber.from(params.tokensPerEpoch).mul(params.numberOfEpochs)
    : BigNumber.from(0)
  const allowanceOk = !totalAmountToFund?.isZero() && allowance?.gte(totalAmountToFund)

  return { allowance, isAllowanceFetched, allowanceOk, twabRewardsAllowanceRefetch }
}
