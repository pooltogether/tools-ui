import classNames from 'classnames'
import { SwapIn } from './SwapIn'
import { SwapOut } from './SwapOut'
import { SwitchSwap } from './SwitchSwap'

export const SwapAmounts: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  return (
    <div className={classNames(className, 'flex flex-col')}>
      <SwapIn />
      <SwitchSwap className='-my-2' />
      <SwapOut />
    </div>
  )
}
