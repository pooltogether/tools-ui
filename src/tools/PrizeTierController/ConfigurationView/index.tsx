import { PrizeTierHistoryItem } from '@prizeTierController/ConfigurationView/PrizeTierHistoryItem'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import classNames from 'classnames'

export const ConfigurationView = (props: { className?: string }) => {
  const { className } = props
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()

  return (
    <ul className={classNames('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {prizeTierHistoryContracts.map((contract) => (
        <PrizeTierHistoryItem
          prizeTierHistoryContract={contract}
          key={'pth-item-' + `${contract.id}`}
        />
      ))}
    </ul>
  )
}
