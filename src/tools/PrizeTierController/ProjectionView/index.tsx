import { PrizePoolItem } from '@prizeTierController/ProjectionView/PrizePoolItem'
import classNames from 'classnames'
import { usePrizePools } from '@hooks/usePrizePools'
import { useAllPrizePoolConfigEdits } from '@prizeTierController/hooks/useAllPrizePoolConfigEdits'

export const ProjectionView = (props: { className?: string }) => {
  const { className } = props
  const prizePools = usePrizePools()
  const allPrizePoolConfigEdits = useAllPrizePoolConfigEdits()

  return (
    <ul className={classNames('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {prizePools.map((prizePool) => (
        <PrizePoolItem
          prizePool={prizePool}
          editHistory={allPrizePoolConfigEdits.find(
            (entry) => entry.prizeTierHistoryContract.chainId === prizePool.chainId
          )}
          key={'pth-item-' + `${prizePool.id()}`}
        />
      ))}
    </ul>
  )
}
