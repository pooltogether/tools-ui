import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { REWARDS_LEARN_MORE_URL } from './constants'

export const RewardsTitle: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <p className='text-accent-1 text-xxs'>
        Create Promotional Rewards campaigns to award your ERC20 tokens to PoolTogether depositors.{' '}
        <a
          className='transition underline text-pt-teal hover:opacity-70 inline-flex items-center space-x-1 text-xxs'
          href={REWARDS_LEARN_MORE_URL}
          target='_blank'
          rel='noreferrer'
        >
          <span>Learn more</span>
          <FeatherIcon icon='external-link' className='w-3 h-3' />
        </a>
      </p>
    </div>
  )
}
