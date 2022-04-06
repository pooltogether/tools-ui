import { LoadingLogo } from '@pooltogether/react-components'
import classNames from 'classnames'
import { PromotionListProps } from '.'

/**
 *
 * @param props
 * @returns
 */
export const LoadingState: React.FC<PromotionListProps> = (props) => {
  const { className } = props
  return (
    <div className={classNames(className, 'flex justify-center mt-20')}>
      <LoadingLogo />
    </div>
  )
}
