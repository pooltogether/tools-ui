import { usePrizePoolTokens } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'

export const DepositToken = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data: tokens, isFetched } = usePrizePoolTokens(prizePool)
  return isFetched ? (
    <>
      <div>{tokens.token.symbol}</div>
    </>
  ) : null
}
