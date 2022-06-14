import { useQuery } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { Amount, Token } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'
import { POOL } from '@constants/pool'
import { parseUnits } from 'ethers/lib/utils'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

export const useSwapPrice = (chainId: number, ticket: Token) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  return useQuery(
    ['useSwapPrice', chainId, ticket?.address, prizePoolAddress],
    async (): Promise<Amount> => await getSwapPrice(chainId, ticket, prizePoolAddress),
    { enabled: !!prizePoolAddress && !!ticket }
  )
}

const getSwapPrice = async (chainId: number, ticket: Token, prizePoolAddress: string) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)
  const prizeToken = POOL[chainId]

  const response: BigNumber = await liquidatorContract.callStatic.computeExactAmountOut(
    prizePoolAddress,
    parseUnits('1', prizeToken.decimals)
  )
  return getAmountFromBigNumber(response, ticket.decimals)
}
