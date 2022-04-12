import { LoadingLogo } from '@pooltogether/react-components'
import classNames from 'classnames'
import { PromotionsListProps } from '.'

/**
 *
 * @param props
 * @returns
 */
export const LoadingState: React.FC<PromotionsListProps> = (props) => {
  const { className } = props
  return (
    <div className={classNames(className, 'flex justify-center mt-20')}>
      <LoadingLogo />
    </div>
  )
}
