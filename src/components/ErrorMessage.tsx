import classNames from 'classnames'

export const ErrorMessage: React.FC<JSX.IntrinsicElements['p']> = (props) => (
  <p {...props} className={classNames(props.className, 'h-5 mt-1 text-xxs text-pt-red-light')} />
)
