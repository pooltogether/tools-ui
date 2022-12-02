import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { calculate } from '@pooltogether/v4-client-js'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  allCombinedPrizeTiersAtom,
  selectedPrizeTierHistoryContractIdAtom,
  isPrizeTierListCollapsed
} from '@prizeTierController/atoms'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { PrizeTierConfigV2, PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { formatCombinedPrizeTier } from '@prizeTierController/utils/formatCombinedPrizeTier'
import { formatPrettyPercentage } from '@prizeTierController/utils/formatPrettyPercentage'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

export const PrizeTierHistoryList = (props: { className?: string }) => {
  const { className } = props
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()

  return (
    <ul className={classNames('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {prizeTierHistoryContracts.map((contract) => (
        <PrizePoolItem prizeTierHistoryContract={contract} key={'pth-item-' + `${contract.id}`} />
      ))}
    </ul>
  )
}

const PrizePoolItem = (props: { prizeTierHistoryContract: PrizeTierHistoryContract }) => {
  const { prizeTierHistoryContract } = props

  const { data: upcomingPrizeTier, isFetched } = usePrizeTierHistoryData(prizeTierHistoryContract)

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      <PrizeTierHistoryTitle
        prizeTierHistoryContract={prizeTierHistoryContract}
        showLink
        className='mb-4'
      />
      {isFetched ? (
        <>
          {!!upcomingPrizeTier ? (
            <PrizeTierState
              prizeTierHistoryContract={prizeTierHistoryContract}
              prizeTier={upcomingPrizeTier}
            />
          ) : (
            <>
              <span>No prize tiers detected.</span>
              <div>
                <EditButton contractId={prizeTierHistoryContract.id} />
              </div>
            </>
          )}
        </>
      ) : (
        'Loading...'
      )}
    </li>
  )
}

/**
 *
 * @param props
 */
const PrizeTierState = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
  prizeTier: PrizeTierConfigV2
}) => {
  const { prizeTierHistoryContract, prizeTier } = props
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [combinedPrizeTiers, setCombinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)
  const prizeTierEdits =
    allPrizeTierEdits[prizeTierHistoryContract.chainId]?.[prizeTierHistoryContract.address]

  // Calculating combined outcome of existing and edited prize tiers:
  const combinedPrizeTier = formatCombinedPrizeTier(prizeTier, prizeTierEdits)
  useEffect(() => {
    setCombinedPrizeTiers(() => {
      const updatedCombinedPrizeTiers = { ...combinedPrizeTiers }
      if (!updatedCombinedPrizeTiers[prizeTierHistoryContract.chainId]) {
        updatedCombinedPrizeTiers[prizeTierHistoryContract.chainId] = {}
      }
      updatedCombinedPrizeTiers[prizeTierHistoryContract.chainId][
        prizeTierHistoryContract.address
      ] = combinedPrizeTier
      return updatedCombinedPrizeTiers
    })
  }, [prizeTier, prizeTierEdits])

  const defaultNumberofPrizesPerTier = calculate.calculateNumberOfPrizesPerTier(prizeTier)
  const defaultTotalPrizes = defaultNumberofPrizesPerTier.reduce((a, b) => a + b, 0)

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

  const [isCollapsed] = useAtom(isPrizeTierListCollapsed)

  return (
    <div>
      <div className={classNames('grid grid-cols-2 gap-x-2 gap-y-3', { 'mb-4': !isCollapsed })}>
        <Stat label='Total Prizes' value={totalPrizes} defaultValue={defaultTotalPrizes} />
        <Stat
          label='Total Value'
          value={formatUnformattedBigNumberForDisplay(
            combinedPrizeTier.prize,
            prizeTierHistoryContract.token.decimals
          )}
          defaultValue={formatUnformattedBigNumberForDisplay(
            prizeTier.prize,
            prizeTierHistoryContract.token.decimals
          )}
        />
        {!isCollapsed && (
          <PrizeTierStats
            prizeTier={combinedPrizeTier}
            defaultMaxPicksValue={prizeTier.maxPicksPerUser}
            defaultBitRangeValue={prizeTier.bitRangeSize}
            defaultDPRValue={prizeTier.dpr}
          />
        )}
      </div>

      {!isCollapsed && (
        <PrizesList
          prizeTierHistoryContract={prizeTierHistoryContract}
          prizeTier={combinedPrizeTier}
          numberOfPrizesPerTier={numberOfPrizesPerTier}
          valueOfPrizesPerTier={valueOfPrizesPerTier}
        />
      )}

      <div className={classNames('w-full flex justify-end', { 'mt-4': !isCollapsed })}>
        <EditButton contractId={prizeTierHistoryContract.id} />
      </div>
    </div>
  )
}

const PrizeTierStats = (props: {
  prizeTier: PrizeTierConfigV2
  defaultMaxPicksValue: number
  defaultBitRangeValue: number
  defaultDPRValue?: number
}) => {
  const { prizeTier, defaultMaxPicksValue, defaultBitRangeValue, defaultDPRValue } = props

  return (
    <>
      <Stat
        label='Max Picks Per User'
        value={prizeTier.maxPicksPerUser}
        defaultValue={defaultMaxPicksValue}
      />
      <Stat
        label='Bit Range Size'
        value={prizeTier.bitRangeSize}
        defaultValue={defaultBitRangeValue}
      />
      {!!prizeTier.dpr && !!defaultDPRValue && (
        <Stat
          label='Draw Percentage Rate'
          value={formatPrettyPercentage(prizeTier.dpr)}
          defaultValue={formatPrettyPercentage(defaultDPRValue)}
        />
      )}
    </>
  )
}

const Stat = (props: { label: string; value: number | string; defaultValue?: number | string }) => (
  <div className='flex flex-col leading-none'>
    <div className='text-xs opacity-80 mb-1'>{props.label}</div>
    <div className='flex gap-2 font-bold text-sm'>
      {props.defaultValue !== undefined && props.value !== props.defaultValue && (
        <span className='line-through opacity-40'>{props.defaultValue}</span>
      )}
      <span
        className={classNames({
          'text-pt-green':
            !!props.defaultValue &&
            (typeof props.value === 'string' && typeof props.defaultValue === 'string'
              ? parseFloat(props.value.replaceAll(',', '')) >
                parseFloat(props.defaultValue.replaceAll(',', ''))
              : props.value > props.defaultValue),
          'text-pt-red':
            !!props.defaultValue &&
            (typeof props.value === 'string' && typeof props.defaultValue === 'string'
              ? parseFloat(props.value.replaceAll(',', '')) <
                parseFloat(props.defaultValue.replaceAll(',', ''))
              : props.value < props.defaultValue)
        })}
      >
        {props.value}
      </span>
    </div>
  </div>
)

const PrizesList = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
  prizeTier: PrizeTierConfigV2
  numberOfPrizesPerTier: number[]
  valueOfPrizesPerTier: BigNumber[]
}) => {
  const { prizeTierHistoryContract, prizeTier, numberOfPrizesPerTier, valueOfPrizesPerTier } = props
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
              key={`pl-${index}-${prizeTierHistoryContract.id}`}
              className='grid grid-cols-3 gap-x-4 font-bold'
            >
              <div>{index + 1}</div>
              <div>{numberOfPrizesPerTier[index]}</div>
              <div>
                {formatUnformattedBigNumberForDisplay(
                  valueOfPrizesPerTier[index],
                  prizeTierHistoryContract.token.decimals
                )}
              </div>
            </li>
          )
        })
        .filter(Boolean)}
    </ul>
  )
}

const EditButton = (props: { contractId: string }) => {
  const setIsOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const setSelectedPrizeTierHistoryContractId = useUpdateAtom(
    selectedPrizeTierHistoryContractIdAtom
  )

  return (
    <Button
      onClick={() => {
        setSelectedPrizeTierHistoryContractId(props.contractId)
        setIsOpen(true)
      }}
      theme={ButtonTheme.transparent}
      size={ButtonSize.sm}
    >
      Edit
    </Button>
  )
}
