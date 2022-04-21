import classNames from 'classnames'

export const SummaryWell = (props) => {
  const { className, children, hidden, hideBackground } = props
  return (
    <div
      className={classNames(
        className,
        'mt-1 rounded-lg dark:text-white text-xxxs xs:text-lg text-opacity-70',
        {
          hidden,
          'bg-opacity-40 bg-pt-purple-dark': !hideBackground,
          'px-3 py-1': !className
        }
      )}
    >
      {children}
    </div>
  )
}

SummaryWell.defaultProps = {
  hideBackground: false
}
