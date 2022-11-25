import { usePrizePoolTokens } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { PrizeTierEditsCheck } from '@prizeTierController/interfaces'
import { PrizePoolTitle } from '@prizeTierController/PrizeTierHistoryList'
import { formatPrettyConfig } from '@prizeTierController/utils/formatPrettyConfig'
import classNames from 'classnames'
import { BigNumber } from 'ethers'

export const PrizePoolEditsDisplay = (props: {
  prizePool: PrizePool
  oldConfig: PrizeTierConfig
  newConfig: PrizeTierConfig
  edits: PrizeTierEditsCheck
  displayRawValues?: boolean
}) => {
  const { prizePool, oldConfig, newConfig, edits, displayRawValues } = props
  const { data: tokens } = usePrizePoolTokens(prizePool)

  const formattedOldConfig = formatPrettyConfig(oldConfig, tokens.token.decimals)
  const formattedNewConfig = formatPrettyConfig(newConfig, tokens.token.decimals)

  if (edits.edited) {
    return (
      <li className='bg-pt-purple-dark p-3 rounded-xl'>
        <PrizePoolTitle prizePool={prizePool} className='mb-2 pb-2 border-b' />
        <div className='flex flex-col gap-2'>
          {edits.bitRangeSize && (
            <EditedNumberValue
              name='Bit Range Size'
              values={[oldConfig.bitRangeSize, newConfig.bitRangeSize]}
              formattedValues={[formattedOldConfig.bitRangeSize, formattedNewConfig.bitRangeSize]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.expiryDuration && (
            <EditedNumberValue
              name='Expiry Duration'
              values={[oldConfig.expiryDuration, newConfig.expiryDuration]}
              formattedValues={[
                formattedOldConfig.expiryDuration,
                formattedNewConfig.expiryDuration
              ]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.maxPicksPerUser && (
            <EditedNumberValue
              name='Max Picks Per User'
              values={[oldConfig.maxPicksPerUser, newConfig.maxPicksPerUser]}
              formattedValues={[
                formattedOldConfig.maxPicksPerUser,
                formattedNewConfig.maxPicksPerUser
              ]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.endTimestampOffset && (
            <EditedNumberValue
              name='End Timestamp Offset'
              values={[oldConfig.endTimestampOffset, newConfig.endTimestampOffset]}
              formattedValues={[
                formattedOldConfig.endTimestampOffset,
                formattedNewConfig.endTimestampOffset
              ]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.prize && (
            <EditedBigNumberValue
              name='Prize Amount'
              values={[oldConfig.prize, newConfig.prize]}
              formattedValues={[formattedOldConfig.prize, formattedNewConfig.prize]}
              displayRawValues={displayRawValues}
            />
          )}
          {edits.tiers.map(
            (tier, i) =>
              tier && (
                <EditedNumberValue
                  name={`Tier ${i + 1}`}
                  values={[oldConfig.tiers[i], newConfig.tiers[i]]}
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
