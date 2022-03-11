import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'

export const DelegationTitle: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames(props.className, 'flex flex-col font-averta')}>
      <h5 className='mb-2'>Lend out your chances of winning to other Ethereum accounts</h5>
      <p className='text-accent-1 text-xs'>
        Ex. CloneX's treasury delegates $500,000 of PTUSDC. 50 random winners receive $10,000 worth
        of PoolTogether chance for 3 months
      </p>
      <a className='transition underline text-pt-teal hover:opacity-70 flex items-center space-x-1'>
        <span>Learn more</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </div>
  )
}
