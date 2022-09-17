import classNames from 'classnames'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

export const SwapAmountContainer: React.FC<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = (props) => (
  <div
    {...props}
    className={classNames(
      props.className,
      'px-4 py-4 bg-pt-purple-light dark:bg-pt-purple-dark rounded-xl overflow-hidden'
    )}
  />
)
