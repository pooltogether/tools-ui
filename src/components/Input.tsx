import React from 'react'
import classNames from 'classnames'
import { DetailedHTMLProps, InputHTMLAttributes } from 'react'

export const Input: React.FC<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = React.forwardRef((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={classNames(
      props.className,
      'py-2 px-4 xs:py-3 xs:px-5 rounded font-semibold xs:text-lg disabled:opacity-50'
    )}
  />
))
