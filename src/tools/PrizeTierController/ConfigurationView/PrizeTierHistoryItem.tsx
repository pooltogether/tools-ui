import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { calculate } from '@pooltogether/v4-client-js'
import {
  isEditPrizeTiersModalOpenAtom,
  prizeTierEditsAtom,
  allCombinedPrizeTiersAtom,
  selectedPrizeTierHistoryContractIdAtom,
  isListCollapsed
} from '@prizeTierController/atoms'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { PrizeTierConfigV2, PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { formatCombinedPrizeTier } from '@prizeTierController/utils/formatCombinedPrizeTier'
import { formatPrettyDprPercentage } from '@prizeTierController/utils/formatPrettyPercentage'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'

export const PrizeTierHistoryItem = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
}) => {
  const { prizeTierHistoryContract } = props
  const { t } = useTranslation()

  const { data: upcomingPrizeTier, isFetched } = usePrizeTierHistoryData(prizeTierHistoryContract)

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      <PrizeTierHistoryTitle
        prizeTierHistoryContract={prizeTierHistoryContract}
        showLink
        className='mb-4'
      />
      {isFetched ? (
        <PrizeTierState
          prizeTierHistoryContract={prizeTierHistoryContract}
          prizeTier={upcomingPrizeTier}
        />
      ) : (
        t('loading')
      )}
    </li>
  )
}

const PrizeTierState = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
  prizeTier: PrizeTierConfigV2
}) => {
  const { prizeTierHistoryContract, prizeTier } = props
  const [allPrizeTierEdits] = useAtom(prizeTierEditsAtom)
  const [combinedPrizeTiers, setCombinedPrizeTiers] = useAtom(allCombinedPrizeTiersAtom)
  const prizeTierEdits =
    allPrizeTierEdits[prizeTierHistoryContract.chainId]?.[prizeTierHistoryContract.address]
  const { t } = useTranslation()

  const [isCollapsed] = useAtom(isListCollapsed)

  const combinedPrizeTier = !!prizeTier
    ? formatCombinedPrizeTier(prizeTier, prizeTierEdits)
    : prizeTierEdits
  useEffect(() => {
    if (!!combinedPrizeTiers) {
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
    }
  }, [prizeTier, prizeTierEdits])

  if (!!combinedPrizeTier) {
    const defaultNumberOfPrizesPerTier: number[] = !!prizeTier
      ? calculate.calculateNumberOfPrizesPerTier(prizeTier)
      : Array(16).fill(0)
    const defaultTotalPrizes = defaultNumberOfPrizesPerTier.reduce((a, b) => a + b, 0)

    const numberOfPrizesPerTier: number[] =
      calculate.calculateNumberOfPrizesPerTier(combinedPrizeTier)
    const valueOfPrizesPerTier = combinedPrizeTier.tiers.map((tier, index) =>
      calculate.calculatePrizeForTierPercentage(
        index,
        tier,
        combinedPrizeTier.bitRangeSize,
        combinedPrizeTier.prize
      )
    )
    const totalPrizes = numberOfPrizesPerTier.reduce((a, b) => a + b, 0)
    const formattedDefaultTotalValue = !!prizeTier
      ? formatUnformattedBigNumberForDisplay(
          prizeTier.prize,
          prizeTierHistoryContract.token.decimals
        )
      : '0'

    return (
      <div>
        <div className={classNames('grid grid-cols-2 gap-x-2 gap-y-3', { 'mb-4': !isCollapsed })}>
          <Stat label={t('totalPrizes')} value={totalPrizes} defaultValue={defaultTotalPrizes} />
          <Stat
            label={t('totalValue')}
            value={formatUnformattedBigNumberForDisplay(
              combinedPrizeTier.prize,
              prizeTierHistoryContract.token.decimals
            )}
            defaultValue={formattedDefaultTotalValue}
          />
          {!isCollapsed && (
            <PrizeTierStats
              prizeTier={combinedPrizeTier}
              defaultMaxPicksValue={prizeTier?.maxPicksPerUser}
              defaultBitRangeValue={prizeTier?.bitRangeSize}
              defaultDPRValue={prizeTier?.dpr}
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
  } else {
    return (
      <>
        <span className='text-xxs opacity-80'>{t('noPrizeTiersDetected')}</span>
        <div className='w-full flex justify-end'>
          <EditButton contractId={prizeTierHistoryContract.id} />
        </div>
      </>
    )
  }
}

const PrizeTierStats = (props: {
  prizeTier: PrizeTierConfigV2
  defaultMaxPicksValue?: number
  defaultBitRangeValue?: number
  defaultDPRValue?: number
}) => {
  const { prizeTier, defaultMaxPicksValue, defaultBitRangeValue, defaultDPRValue } = props
  const { t } = useTranslation()

  return (
    <>
      <Stat
        label={t('maxPicksPerUser')}
        value={prizeTier.maxPicksPerUser}
        defaultValue={defaultMaxPicksValue}
      />
      <Stat
        label={t('bitRangeSize')}
        value={prizeTier.bitRangeSize}
        defaultValue={defaultBitRangeValue}
      />
      {!!prizeTier.dpr && (
        <Stat
          label={t('drawPercentageRate')}
          value={formatPrettyDprPercentage(prizeTier.dpr)}
          defaultValue={formatPrettyDprPercentage(defaultDPRValue ?? 0)}
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
            props.defaultValue !== undefined &&
            (typeof props.value === 'string' && typeof props.defaultValue === 'string'
              ? parseFloat(props.value.replaceAll(',', '')) >
                parseFloat(props.defaultValue.replaceAll(',', ''))
              : props.value > props.defaultValue),
          'text-pt-red':
            props.defaultValue !== undefined &&
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
  const { t } = useTranslation()

  return (
    <ul>
      <li className='grid grid-cols-3 gap-x-4 opacity-80'>
        <div>{t('tier')}</div>
        <div>{t('prizes')}</div>
        <div>{t('value')}</div>
      </li>
      {prizeTier.tiers.map((tier, index) => {
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
      })}
    </ul>
  )
}

const EditButton = (props: { contractId: string }) => {
  const setIsOpen = useUpdateAtom(isEditPrizeTiersModalOpenAtom)
  const setSelectedPrizeTierHistoryContractId = useUpdateAtom(
    selectedPrizeTierHistoryContractIdAtom
  )
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => {
        setSelectedPrizeTierHistoryContractId(props.contractId)
        setIsOpen(true)
      }}
      theme={ButtonTheme.transparent}
      size={ButtonSize.sm}
    >
      {t('edit')}
    </Button>
  )
}
