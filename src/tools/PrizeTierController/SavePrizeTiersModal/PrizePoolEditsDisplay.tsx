import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { PrizePoolTitle } from '@prizeTierController/PrizeTierHistoryList'
import { checkForPrizeEdits } from '@prizeTierController/utils/checkForPrizeEdits'
import classNames from 'classnames'
import { BigNumber } from 'ethers'

export const PrizePoolEditsDisplay = (props: {
  prizePool: PrizePool
  oldConfig: PrizeTierConfig
  newConfig: PrizeTierConfig
}) => {
  const { prizePool, oldConfig, newConfig } = props
  const edits = checkForPrizeEdits(oldConfig, newConfig)

  // TODO: Allow user to pick if they want to see tier percentages or prize amount changes
  // TODO: Style this so it looks nicer :)

  if (edits.edited) {
    return (
      <li key={`prize-pool-edits-${prizePool.id()}`}>
        <PrizePoolTitle prizePool={prizePool} className='mb-4' />
        <div className='flex flex-col gap-2'>
          {edits.bitRangeSize && (
            <EditedNumberValue
              name='Bit Range Size'
              oldValue={oldConfig.bitRangeSize}
              newValue={newConfig.bitRangeSize}
            />
          )}
          {edits.expiryDuration && (
            <EditedNumberValue
              name='Expiry Duration'
              oldValue={oldConfig.expiryDuration}
              newValue={newConfig.expiryDuration}
            />
          )}
          {edits.maxPicksPerUser && (
            <EditedNumberValue
              name='Max Picks Per User'
              oldValue={oldConfig.maxPicksPerUser}
              newValue={newConfig.maxPicksPerUser}
            />
          )}
          {edits.prize && (
            <EditedBigNumberValue
              name='Prize Amount'
              oldValue={oldConfig.prize}
              newValue={newConfig.prize}
            />
          )}
          {edits.tiers.map(
            (tier, i) =>
              tier && (
                <EditedNumberValue
                  name={`Tier ${i + 1}`}
                  oldValue={oldConfig.tiers[i]}
                  newValue={newConfig.tiers[i]}
                />
              )
          )}
        </div>
      </li>
    )
  }
}

const EditedNumberValue = (props: { name: string; oldValue: number; newValue: number }) => (
  <div className='flex gap-2'>
    <p>{props.name}:</p>
    <p>{props.oldValue}</p>
    {'->'}
    <p
      className={classNames({
        'text-pt-green': props.newValue > props.oldValue,
        'text-pt-red': props.newValue < props.oldValue
      })}
    >
      {props.newValue}
    </p>
  </div>
)

const EditedBigNumberValue = (props: {
  name: string
  oldValue: BigNumber
  newValue: BigNumber
}) => (
  <div className='flex gap-2'>
    <p>{props.name}:</p>
    <p>{props.oldValue.toString()}</p>
    {'->'}
    <p
      className={classNames({
        'text-pt-green': props.newValue.gt(props.oldValue),
        'text-pt-red': props.newValue.lt(props.oldValue)
      })}
    >
      {props.newValue.toString()}
    </p>
  </div>
)
