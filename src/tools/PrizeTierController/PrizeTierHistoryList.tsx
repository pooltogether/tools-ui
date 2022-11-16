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
import { BlockExplorerLink, useUsersAddress } from '@pooltogether/wallet-connection'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { getCombinedPrizeTier } from '@prizeTierController/utils/getCombinedPrizeTier'
import { getPrizeTierFromFormValues } from '@prizeTierController/utils/getPrizeTierFromFormValues'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  // EditPrizeTierModalState,
  // editPrizeTierModalStateAtom,
  isEditPrizeTiersModalOpenAtom,
  prizeTierControllerChainIdAtom,
  prizeTierEditsAtom,
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
  const [chainId] = useAtom(prizeTierControllerChainIdAtom)
  const usersAddress = useUsersAddress()

  const { data, isFetched } = usePrizeTierHistoryData(prizePool)

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      <PrizePoolTitle prizePool={prizePool} className='mb-4' />
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
export const PrizePoolTitle = (props: { prizePool: PrizePool; className?: string }) => (
  <div className={classNames('flex justify-between font-bold', props.className)}>
    <div className='flex space-x-2 items-center'>
      <NetworkIcon chainId={props.prizePool.chainId} />
      <div>{getNetworkNiceNameByChainId(props.prizePool.chainId)}</div>
      <PrizePoolToken prizePool={props.prizePool} />
    </div>
    <BlockExplorerLink address={props.prizePool.address} chainId={props.prizePool.chainId}>
      <span>{`${props.prizePool.address.slice(0, 6)}...`}</span>
    </BlockExplorerLink>
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
  const prizeTierEdits =
    allPrizeTierEdits[prizePool.chainId]?.[prizePool.prizeTierHistoryMetadata.address]
  const { data: tokens } = usePrizePoolTokens(prizePool)

  const combinedPrizeTier = getCombinedPrizeTier(prizeTier, prizeTierEdits)

  console.log(prizePool.chainId, { prizeTierEdits, combinedPrizeTier, prizeTier })

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
  const totalValueOfPrizes = valueOfPrizesPerTier.reduce(
    (a, b, i) => a.add(b.mul(numberOfPrizesPerTier[i])),
    BigNumber.from(0)
  )
  const [seeMore, setSeeMore] = useState(false)
  const setIsOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  // const setPrizeTierModalState = useUpdateAtom(editPrizeTierModalStateAtom)
  const setSelectedPrizePoolId = useUpdateAtom(selectedPrizePoolIdAtom)
  const setSelectedPrizeTierHistoryAddress = useUpdateAtom(selectedPrizeTierHistoryAddressAtom)
  const setSelectedPrizeTierHistoryChainId = useUpdateAtom(selectedPrizeTierHistoryChainIdAtom)

  return (
    <div>
      <div className={classNames('grid grid-cols-2 gap-x-2 gap-y-3', { 'mb-4': seeMore })}>
        <Stat label='Total Prizes' value={totalPrizes} />
        <Stat
          label='Total Value'
          value={formatUnformattedBigNumberForDisplay(totalValueOfPrizes, tokens?.token.decimals)}
        />
        {seeMore && <PrizeTierStats prizePool={prizePool} prizeTier={combinedPrizeTier} />}
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
            // setPrizeTierModalState(EditPrizeTierModalState.singular)
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

const PrizeTierStats = (props: { prizePool: PrizePool; prizeTier: PrizeTierConfig }) => {
  const { prizeTier, prizePool } = props
  const { data: tokens } = usePrizePoolTokens(prizePool)

  return (
    <>
      <Stat label='Max Picks Per User' value={prizeTier.maxPicksPerUser} />
      <Stat
        label='Prize'
        value={formatUnformattedBigNumberForDisplay(prizeTier.prize, tokens?.token.decimals)}
      />
      <Stat label='Bit Range Size' value={prizeTier.bitRangeSize} />
    </>
  )
}

const Stat = (props: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className='flex flex-col leading-none'>
    <div className='text-xs opacity-80 mb-1'>{props.label}</div>
    <div className='font-bold text-sm'>{props.value}</div>
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
