import classNames from 'classnames'

export const SwapAmountContainer: React.FC<{ className?: string }> = (props) => (
  <div
    {...props}
    className={classNames(
      props.className,
      'px-4 py-4 bg-pt-purple-light dark:bg-pt-purple-dark rounded-xl overflow-hidden'
    )}
  />
)
