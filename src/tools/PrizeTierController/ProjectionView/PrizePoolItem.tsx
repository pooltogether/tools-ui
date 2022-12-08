import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { calculate } from '@pooltogether/v4-utils-js'
import { allCombinedPrizeTiersAtom } from '@prizeTierController/atoms'
import { DRAWS_PER_DAY } from '@prizeTierController/config'
import { usePrizePoolTvl } from '@prizeTierController/hooks/usePrizePoolTvl'
import { PrizeTierConfigV2, PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { calculateDprMultiplier } from '@prizeTierController/utils/calculateDprMultiplier'
import { formatPrettyPercentage } from '@prizeTierController/utils/formatPrettyPercentage'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'

// TODO: localization

export const PrizePoolItem = (props: {
  prizePool: PrizePool
  prizeTierHistoryContract: PrizeTierHistoryContract
}) => {
  const { prizePool, prizeTierHistoryContract } = props
  const [combinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)

  if (!!prizePool && !!prizeTierHistoryContract && !!combinedPrizeTiers) {
    const prizeTier = combinedPrizeTiers[prizePool.chainId]?.[prizeTierHistoryContract.address]
    if (!!prizeTier) {
      return (
        <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
          <PrizeTierHistoryTitle
            prizeTierHistoryContract={prizeTierHistoryContract}
            showLink
            className='mb-4'
          />
          <PrizePoolProjections
            prizePool={prizePool}
            prizeTierHistoryContract={prizeTierHistoryContract}
            prizeTier={prizeTier}
          />
        </li>
      )
    }
  }
}

const PrizePoolProjections = (props: {
  prizePool: PrizePool
  prizeTierHistoryContract: PrizeTierHistoryContract
  prizeTier: PrizeTierConfigV2
}) => {
  const { prizePool, prizeTierHistoryContract, prizeTier } = props
  const { data: tvl, isFetched: isFetchedTvl } = usePrizePoolTvl(prizePool)
  const { t } = useTranslation()

  const dprMultiplier = isFetchedTvl
    ? calculateDprMultiplier(
        prizeTier.dpr,
        tvl,
        prizeTier.prize,
        prizeTierHistoryContract.token.decimals
      )
    : 0

  const prizes = prizeTier.tiers.map((tier, i) =>
    parseFloat(
      formatUnits(
        calculate.calculatePrizeForTierPercentage(i, tier, prizeTier.bitRangeSize, prizeTier.prize),
        parseInt(prizeTierHistoryContract.token.decimals)
      )
    )
  )
  const numPrizesPerTier = calculate.calculateNumberOfPrizesPerTier(prizeTier)
  const prizeChances = numPrizesPerTier.map((value) => value * dprMultiplier)

  const expectedTierPrizeAmounts = prizes.map((prize, i) => prize * prizeChances[i])
  const expectedPrizeAmount = expectedTierPrizeAmounts.reduce((a, b) => a + b, 0)

  return (
    <>
      {isFetchedTvl ? (
        <>
          <BasicStats
            prizeTier={prizeTier}
            tvl={tvl}
            token={prizeTierHistoryContract.token}
            className='mb-2'
          />
          <DrawBreakdown
            prizeAmount={expectedPrizeAmount}
            prizes={prizes}
            prizeChances={prizeChances}
            token={prizeTierHistoryContract.token}
            className='mb-2'
          />
          <PrizesOverTime
            prizeAmount={expectedPrizeAmount}
            prizes={prizes}
            prizeChances={prizeChances}
            token={prizeTierHistoryContract.token}
            className='mb-2'
          />
          <VarianceInput />
        </>
      ) : (
        t('loading')
      )}
    </>
  )
}

const BasicStats = (props: {
  prizeTier: PrizeTierConfigV2
  tvl: number
  token: Token
  className?: string
}) => {
  const { prizeTier, tvl, token, className } = props

  // TODO: make tvl input (with reset button to return to actual value)

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Basic Stats' />
      <span>
        TVL: {tvl.toLocaleString('en', { maximumFractionDigits: 0 })} {token.symbol}
      </span>
      <span>DPR: {formatPrettyPercentage(prizeTier.dpr)}</span>
    </div>
  )
}

const DrawBreakdown = (props: {
  prizeAmount: number
  prizes: number[]
  prizeChances: number[]
  token: Token
  className?: string
}) => {
  const { prizeAmount, prizes, prizeChances, token, className } = props

  const formattedPrizeAmount = prizeAmount.toLocaleString('en', { maximumFractionDigits: 0 })
  // TODO: show claimable vs dropped prizes estimates (make dropped prizes a % input - default 15%?)

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Draw Breakdown' />
      <span>
        Total Estimated Prizes: {formattedPrizeAmount} {token.symbol}
      </span>
      <ul>
        {prizes.map((prize, i) => {
          if (prize === 0) return null

          return (
            <li key={`pl-${i}-${prizeChances[i]}`}>
              {prizeChances[i].toLocaleString('en', { maximumFractionDigits: 4 })} prizes of{' '}
              {prize.toLocaleString('en', { maximumFractionDigits: 2 })} {token.symbol}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const PrizesOverTime = (props: {
  prizeAmount: number
  prizes: number[]
  prizeChances: number[]
  token: Token
  className?: string
}) => {
  const { prizeAmount, prizes, prizeChances, token, className } = props

  const formattedWeeklyPrizeAmount = (prizeAmount * 7 * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })
  const formattedYearlyPrizeAmount = (prizeAmount * 365 * DRAWS_PER_DAY).toLocaleString('en', {
    maximumFractionDigits: 0
  })

  // TODO: show prizes over time chart

  return (
    <div className={classNames('flex flex-col', className)}>
      <SectionTitle text='Prizes Over Time' />
      <span>
        Weekly prizes: {formattedWeeklyPrizeAmount} {token.symbol}
      </span>
      <span>
        Yearly prizes: {formattedYearlyPrizeAmount} {token.symbol}
      </span>
    </div>
  )
}

const VarianceInput = () => {
  // TODO: include variance input to change charts, estimates, etc.

  return <></>
}

const SectionTitle = (props: { text: string; className?: string }) => {
  return <h3 className={classNames('text-xs opacity-80', props.className)}>{props.text}</h3>
}
