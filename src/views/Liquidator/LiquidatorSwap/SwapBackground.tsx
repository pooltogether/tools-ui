import classNames from 'classnames'

export const SwapBackground: React.FC<{ className?: string }> = (props) => {
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
