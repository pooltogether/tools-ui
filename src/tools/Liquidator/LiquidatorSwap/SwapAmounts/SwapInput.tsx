import { Input, InputProps } from '@components/Input'
import classNames from 'classnames'
import React from 'react'

/**
 * An input component with color classNames
 */
export const SwapInput: React.FC<InputProps> = React.forwardRef((props, ref) => {
  const { className, ...inputProps } = props
  return (
    <input
      {...inputProps}
      ref={ref}
      className={classNames(
        className,
        'font-semibold xs:text-lg disabled:opacity-50',
        'bg-pt-purple-light dark:bg-pt-purple-dark focus:outline-none'
      )}
    />
  )
})
SwapInput.displayName = 'StyledInput'
