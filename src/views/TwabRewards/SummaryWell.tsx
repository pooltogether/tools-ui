import classNames from 'classnames'

export const SummaryWell = (props) => {
  const { className, children, hidden } = props
  return (
    <div
      className={classNames(
        className,
        'bg-opacity-40 mt-1 bg-pt-purple-dark px-3 py-1 rounded-lg text-white text-opacity-70',
        {
          hidden
        }
      )}
    >
      {children}
    </div>
  )
}
