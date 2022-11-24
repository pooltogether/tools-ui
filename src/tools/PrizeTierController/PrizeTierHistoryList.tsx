import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import {
  Button,
  ButtonSize,
  ButtonTheme,
  NetworkIcon,
  TokenIcon
} from '@pooltogether/react-components'
import {
  formatUnformattedBigNumberForDisplay,
  getNetworkNiceNameByChainId
} from '@pooltogether/utilities'
import { calculate, PrizePool, PrizeTierConfig } from '@pooltogether/v4-client-js'
import { BlockExplorerLink } from '@pooltogether/wallet-connection'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { formatCombinedPrizeTier } from '@prizeTierController/utils/formatCombinedPrizeTier'
import { checkForPrizeCompatibilityErrors } from '@prizeTierController/utils/checkForPrizeCompatibilityErrors'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  allCombinedPrizeTiersAtom,
  selectedPrizePoolIdAtom,
  selectedPrizeTierHistoryAddressAtom,
  selectedPrizeTierHistoryChainIdAtom
} from './atoms'

export const PrizeTierHistoryList = (props: { className?: string }) => {
  const { className } = props
  const prizePools = usePrizePools()

  return (
    <ul className={classNames('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {prizePools.map((prizePool) => (
        <PrizePoolItem prizePool={prizePool} key={'pth-item-' + prizePool.id()} />
      ))}
    </ul>
  )
}

const PrizePoolItem = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props

  const { data, isFetched } = usePrizeTierHistoryData(prizePool)

  // TODO: Need to display errored icon when this pool isn't in sync with others

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      <PrizePoolTitle prizePool={prizePool} showLink className='mb-4' />
      {isFetched ? (
        <PrizeTierState prizePool={prizePool} prizeTier={data.upcomingPrizeTier} />
      ) : (
        'Loading...'
      )}
    </li>
  )
}

/**
 *
 * @param props
 * @returns
 */
export const PrizePoolTitle = (props: {
  prizePool: PrizePool
  showLink?: boolean
  className?: string
}) => (
  <div className={classNames('flex justify-between font-bold', props.className)}>
    <div className='flex space-x-2 items-center'>
      <NetworkIcon chainId={props.prizePool.chainId} />
      <div>{getNetworkNiceNameByChainId(props.prizePool.chainId)}</div>
      <PrizePoolToken prizePool={props.prizePool} />
    </div>
    {props.showLink && (
      <BlockExplorerLink address={props.prizePool.address} chainId={props.prizePool.chainId}>
        <span>{`${props.prizePool.address.slice(0, 6)}...`}</span>
      </BlockExplorerLink>
    )}
  </div>
)

const PrizePoolToken = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data: tokens, isFetched } = usePrizePoolTokens(prizePool)
  return isFetched ? (
    <>
      <TokenIcon address={tokens.token.address} chainId={prizePool.chainId} />
      <div>{tokens.token.symbol}</div>
    </>
  ) : null
}

/**
 *
 * @param props
 */
const PrizeTierState = (props: { prizePool: PrizePool; prizeTier: PrizeTierConfig }) => {
  const { prizePool, prizeTier } = props
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [combinedPrizeTiers, setCombinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)
  const prizeTierEdits =
    allPrizeTierEdits[prizePool.chainId]?.[prizePool.prizeTierHistoryMetadata.address]
  const { data: tokens } = usePrizePoolTokens(prizePool)

  // Calculating combined outcome of existing and edited prize tiers:
  const combinedPrizeTier = formatCombinedPrizeTier(prizeTier, prizeTierEdits)
  useEffect(() => {
    setCombinedPrizeTiers(() => {
      const updatedCombinedPrizeTiers = { ...combinedPrizeTiers }
      if (!updatedCombinedPrizeTiers[prizePool.chainId]) {
        updatedCombinedPrizeTiers[prizePool.chainId] = {}
      }
      updatedCombinedPrizeTiers[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address] =
        combinedPrizeTier
      return updatedCombinedPrizeTiers
    })
  }, [prizeTierEdits])

  const numberOfPrizesPerTier = calculate.calculateNumberOfPrizesPerTier(combinedPrizeTier)
  const valueOfPrizesPerTier = combinedPrizeTier.tiers.map((tier, index) =>
    calculate.calculatePrizeForTierPercentage(
      index,
      tier,
      combinedPrizeTier.bitRangeSize,
      combinedPrizeTier.prize
    )
  )
  const totalPrizes = numberOfPrizesPerTier.reduce((a, b) => a + b, 0)

  const allPrizeCompatibilityErrors = checkForPrizeCompatibilityErrors(combinedPrizeTiers)
  const prizeTierErrors =
    allPrizeCompatibilityErrors.find(
      (entry) =>
        entry.chainId === prizePool.chainId &&
        entry.address === prizePool.prizeTierHistoryMetadata.address
    )?.errors || []

  const [seeMore, setSeeMore] = useState(false)
  const setIsOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const setSelectedPrizePoolId = useUpdateAtom(selectedPrizePoolIdAtom)
  const setSelectedPrizeTierHistoryAddress = useUpdateAtom(selectedPrizeTierHistoryAddressAtom)
  const setSelectedPrizeTierHistoryChainId = useUpdateAtom(selectedPrizeTierHistoryChainIdAtom)

  return (
    <div>
      <div className={classNames('grid grid-cols-2 gap-x-2 gap-y-3', { 'mb-4': seeMore })}>
        <Stat label='Total Prizes' value={totalPrizes} />
        <Stat
          label='Total Value'
          value={formatUnformattedBigNumberForDisplay(
            combinedPrizeTier.prize,
            tokens?.token.decimals
          )}
          errored={prizeTierErrors.includes('prizeAmount')}
        />
        {seeMore && (
          <PrizeTierStats
            prizeTier={combinedPrizeTier}
            maxPicksErrored={prizeTierErrors.includes('maxPicks')}
            bitRangeErrored={prizeTierErrors.includes('bitRange')}
          />
        )}
      </div>

      {seeMore && (
        <>
          <PrizesList
            prizePool={prizePool}
            prizeTier={combinedPrizeTier}
            numberOfPrizesPerTier={numberOfPrizesPerTier}
            valueOfPrizesPerTier={valueOfPrizesPerTier}
          />
        </>
      )}

      <div className={classNames('w-full flex justify-between', { 'mt-4': seeMore })}>
        <button onClick={() => setSeeMore(!seeMore)}>{seeMore ? 'See less' : 'See more'}</button>
        <Button
          onClick={() => {
            setSelectedPrizePoolId(prizePool.id())
            setSelectedPrizeTierHistoryAddress(prizePool.prizeTierHistoryMetadata.address)
            setSelectedPrizeTierHistoryChainId(prizePool.chainId)
            setIsOpen(true)
          }}
          theme={ButtonTheme.transparent}
          size={ButtonSize.sm}
        >
          Edit
        </Button>
      </div>
    </div>
  )
}

const PrizeTierStats = (props: {
  prizeTier: PrizeTierConfig
  maxPicksErrored: boolean
  bitRangeErrored: boolean
}) => {
  const { prizeTier, maxPicksErrored, bitRangeErrored } = props

  return (
    <>
      <Stat
        label='Max Picks Per User'
        value={prizeTier.maxPicksPerUser}
        errored={maxPicksErrored}
      />
      <Stat label='Bit Range Size' value={prizeTier.bitRangeSize} errored={bitRangeErrored} />
    </>
  )
}

// TODO: An errored stat should show a warning icon instead of red highlights and border
const Stat = (props: { label: React.ReactNode; value: React.ReactNode; errored?: boolean }) => (
  <div
    className={classNames('flex flex-col leading-none', {
      'border-2 border-pt-red rounded p-2': props.errored
    })}
  >
    <div className='text-xs opacity-80 mb-1'>{props.label}</div>
    <div
      className={classNames('font-bold text-sm', {
        'text-pt-red': props.errored
      })}
    >
      {props.value}
    </div>
  </div>
)

const PrizesList = (props: {
  prizePool: PrizePool
  prizeTier: PrizeTierConfig
  numberOfPrizesPerTier: number[]
  valueOfPrizesPerTier: BigNumber[]
}) => {
  const { prizePool, prizeTier, numberOfPrizesPerTier, valueOfPrizesPerTier } = props
  const { data: tokens } = usePrizePoolTokens(prizePool)
  return (
    <ul>
      <li className='grid grid-cols-3 gap-x-4 opacity-80'>
        <div>Tier</div>
        <div>Prizes</div>
        <div>Value</div>
      </li>
      {prizeTier.tiers
        .map((tier, index) => {
          if (tier === 0) return null

          return (
            <li
              key={`pl-${index}-${prizePool.id()}`}
              className='grid grid-cols-3 gap-x-4 font-bold'
            >
              <div>{index + 1}</div>
              <div>{numberOfPrizesPerTier[index]}</div>
              <div>
                {formatUnformattedBigNumberForDisplay(
                  valueOfPrizesPerTier[index],
                  tokens?.token.decimals
                )}
              </div>
            </li>
          )
        })
        .filter(Boolean)}
    </ul>
  )
}
