import { slippagePercentAtom } from '@liquidator/atoms'
import { useQuery } from 'wagmi'
import { useAtom } from 'jotai'
import { BigNumber, ethers } from 'ethers'
import { Token } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { percentageOfBigNumber } from '@utils/percentageOfBigNumber'

// TODO: expand for other direction?
export const useExpectedSwapAmountOut = (
  chainId: number,
  ticket: Token,
  amountUnformatted: BigNumber
) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  const [slippagePercent] = useAtom(slippagePercentAtom)
  return useQuery(
    [
      'useExpectedSwapAmountOut',
      chainId,
      slippagePercent,
      ticket?.address,
      prizePoolAddress,
      amountUnformatted?.toString()
    ],
    () =>
      getSwapExpectedAmountOut(
        chainId,
        ticket,
        prizePoolAddress,
        slippagePercent,
        amountUnformatted
      ),
    { enabled: !!prizePoolAddress && !!ticket && !!amountUnformatted }
  )
}

const getSwapExpectedAmountOut = async (
  chainId: number,
  ticket: Token,
  prizePoolAddress: string,
  slippagePercent: number,
  amountUnformatted: BigNumber
) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)

  // TODO: Min amount needs to be calculated based on the ticket token
  const minimumAmountUnformatted = amountUnformatted.sub(
    percentageOfBigNumber(amountUnformatted, slippagePercent)
  )
  console.log('getSwapExpectedAmountOut pre', {
    prizePoolAddress,
    liquidatorAddress,
    ticket,
    amountUnformatted,
    amount: amountUnformatted.toString(),
    minimumAmountUnformatted,
    minAmount: minimumAmountUnformatted.toString()
  })

  const response: BigNumber = await liquidatorContract.callStatic.swapExactAmountIn(
    prizePoolAddress,
    amountUnformatted,
    minimumAmountUnformatted,
    {
      // TODO: This is sketch. Need to provide a non zero address to be able to call this function.
      from: '0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0'
    }
  )
  console.log('getSwapExpectedAmountOut', {
    response,
    amt: getAmountFromBigNumber(response, ticket.decimals)
  })

  return getAmountFromBigNumber(response, ticket.decimals)
}
