import { fallbackConfig } from '@prizeTierController/fallbacks'
import {
  PrizeTierConfigV2,
  PrizeTierEditsCheck,
  PrizeTierHistoryContract
} from '@prizeTierController/interfaces'
import { PrizeTierHistoryTitle } from '@prizeTierController/PrizeTierHistoryTitle'
import { formatPrettyConfig } from '@prizeTierController/utils/formatPrettyConfig'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { useTranslation } from 'next-i18next'

export const PrizePoolEditsDisplay = (props: {
  prizeTierHistoryContract: PrizeTierHistoryContract
  oldConfig?: PrizeTierConfigV2
  newConfig: PrizeTierConfigV2
  edits: PrizeTierEditsCheck
  displayRawValues?: boolean
}) => {
  const { prizeTierHistoryContract, oldConfig, newConfig, edits, displayRawValues } = props
  const { t } = useTranslation()

  const formattedOldConfig = formatPrettyConfig(
    oldConfig ?? fallbackConfig,
    prizeTierHistoryContract.token.decimals
  )
  const formattedNewConfig = formatPrettyConfig(newConfig, prizeTierHistoryContract.token.decimals)

  if (edits.edited) {
    return (
      <li className='bg-pt-purple-dark p-3 rounded-xl'>
        <PrizeTierHistoryTitle
          prizeTierHistoryContract={prizeTierHistoryContract}
          className='mb-2 pb-2 border-b'
        />
        <div className='flex flex-col gap-2'>
          {edits.bitRangeSize && (
            <EditedNumberValue
              name={t('bitRangeSize')}
              values={[
                oldConfig?.bitRangeSize ?? fallbackConfig.bitRangeSize,
                newConfig.bitRangeSize
              ]}
              formattedValues={[formattedOldConfig.bitRangeSize, formattedNewConfig.bitRangeSize]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.expiryDuration && (
            <EditedNumberValue
              name={t('expiryDuration')}
              values={[
                oldConfig?.expiryDuration ?? fallbackConfig.expiryDuration,
                newConfig.expiryDuration
              ]}
              formattedValues={[
                formattedOldConfig.expiryDuration,
                formattedNewConfig.expiryDuration
              ]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.maxPicksPerUser && (
            <EditedNumberValue
              name={t('maxPicksPerUser')}
              values={[
                oldConfig?.maxPicksPerUser ?? fallbackConfig.maxPicksPerUser,
                newConfig.maxPicksPerUser
              ]}
              formattedValues={[
                formattedOldConfig.maxPicksPerUser,
                formattedNewConfig.maxPicksPerUser
              ]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.endTimestampOffset && (
            <EditedNumberValue
              name={t('endTimestampOffset')}
              values={[
                oldConfig?.endTimestampOffset ?? fallbackConfig.endTimestampOffset,
                newConfig.endTimestampOffset
              ]}
              formattedValues={[
                formattedOldConfig.endTimestampOffset,
                formattedNewConfig.endTimestampOffset
              ]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.prize && (
            <EditedBigNumberValue
              name={t('prizeAmountString')}
              values={[oldConfig?.prize ?? fallbackConfig.prize, newConfig.prize]}
              formattedValues={[formattedOldConfig.prize, formattedNewConfig.prize]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.dpr && (
            <EditedNumberValue
              name={t('drawPercentageRate')}
              values={[oldConfig?.dpr ?? fallbackConfig.dpr, newConfig.dpr]}
              formattedValues={[formattedOldConfig.dpr, formattedNewConfig.dpr]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.tiers.map(
            (tier, i) =>
              tier && (
                <EditedNumberValue
                  name={`${t('tier')} ${i + 1}`}
                  values={[oldConfig?.tiers[i] ?? fallbackConfig.tiers[i], newConfig.tiers[i]]}
                  formattedValues={[formattedOldConfig.tiers[i], formattedNewConfig.tiers[i]]}
                  displayRawValues={displayRawValues}
                />
              )
          )}
        </div>
      </li>
    )
  }
}

const EditedNumberValue = (props: {
  name: string
  values: number[]
  formattedValues: string[]
  displayRawValues?: boolean
}) => (
  <div className='flex gap-2 text-xs'>
    <p className='text-xs'>{props.name}:</p>
    <p className='opacity-40 text-xs'>
      {props.displayRawValues ? props.values[0] : props.formattedValues[0]}
    </p>
    {'->'}
    <p
      className={classNames('text-xs', {
        'text-pt-green': props.values[1] > props.values[0],
        'text-pt-red': props.values[1] < props.values[0]
      })}
    >
      {props.displayRawValues ? props.values[1] : props.formattedValues[1]}
    </p>
  </div>
)

const EditedBigNumberValue = (props: {
  name: string
  values: BigNumber[]
  formattedValues: string[]
  displayRawValues?: boolean
}) => (
  <div className='flex gap-2 text-xs'>
    <p className='text-xs'>{props.name}:</p>
    <p className='opacity-40 text-xs'>
      {props.displayRawValues ? props.values[0].toString() : props.formattedValues[0]}
    </p>
    {'->'}
    <p
      className={classNames('text-xs', {
        'text-pt-green': props.values[1].gt(props.values[0]),
        'text-pt-red': props.values[1].lt(props.values[0])
      })}
    >
      {props.displayRawValues ? props.values[1].toString() : props.formattedValues[1]}
    </p>
  </div>
)
