import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { DELEGATION_LEARN_MORE_URL } from './constants'

export const DelegationTitle: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames(props.className, 'flex flex-col font-averta')}>
      <p className='text-accent-1 text-xs'>
        When you delegate, you're giving the chosen address additional chances to win without losing
        custody of your underlying deposit.
      </p>
      <a
        className='transition underline text-pt-teal hover:opacity-70 flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>Learn more</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </div>
  )
}
