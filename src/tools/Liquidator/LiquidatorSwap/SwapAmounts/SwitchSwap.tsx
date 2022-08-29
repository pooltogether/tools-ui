import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'

export const SwitchSwap: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  return (
    <div
      className={classNames(
        className,
        'p-1 bg-pt-purple-light dark:bg-pt-purple-dark rounded-xl mx-auto border-2 border-pt-purple-lightest dark:border-pt-purple-darkest'
      )}
      style={{ zIndex: '2' }}
    >
      <FeatherIcon className='w-4 h-4 opacity-70' icon='arrow-down' />
    </div>
  )
}
