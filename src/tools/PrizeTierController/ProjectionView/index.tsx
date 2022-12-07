import { PrizePoolItem } from '@prizeTierController/ProjectionView/PrizePoolItem'
import classNames from 'classnames'
import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'

export const ProjectionView = (props: { className?: string }) => {
  const { className } = props
  const prizePools = usePrizePools()
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()

  return (
    <ul className={classNames('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {prizePools.map((prizePool) => (
        <PrizePoolItem
          prizePool={prizePool}
          prizeTierHistoryContract={prizeTierHistoryContracts.find(
            (contract) => contract.chainId === prizePool.chainId && contract.isV2
          )}
          key={'pth-item-' + `${prizePool.id()}`}
        />
      ))}
    </ul>
  )
}
