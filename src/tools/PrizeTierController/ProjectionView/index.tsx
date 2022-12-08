import { PrizePoolItem } from '@prizeTierController/ProjectionView/PrizePoolItem'
import classNames from 'classnames'
import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'

export const ProjectionView = (props: { className?: string }) => {
  const { className } = props
  const prizePools = usePrizePools()
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()

  // TODO: [BUG] make sure all pools are displayed (currently only displaying loaded pools?)

  return (
    <ul className={classNames('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {prizeTierHistoryContracts
        .filter((contract) => contract.isV2)
        .map((contract) => (
          <PrizePoolItem
            prizePool={prizePools.find((pool) => pool.chainId === contract.chainId)}
            prizeTierHistoryContract={contract}
            key={'pth-item-' + `${contract.id}`}
          />
        ))}
    </ul>
  )
}
