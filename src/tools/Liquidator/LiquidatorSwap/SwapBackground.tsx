import classNames from 'classnames'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

export const SwapBackground: React.FC<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = (props) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        'px-2 py-2 rounded-xl bg-pt-purple-lightest dark:bg-pt-purple-darkest flex flex-col'
      )}
    />
  )
}
