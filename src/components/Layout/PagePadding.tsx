import React from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

interface PagePaddingProps {
  children?: React.ReactNode
  className?: string
}

/**
 * PagePadding includes default padding for pages & intro/outro animations
 * @param props
 * @returns
 */
export const PagePadding = (props: PagePaddingProps) => {
  const { className, children } = props

  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      <motion.div
        id='modal-animation-wrapper'
        transition={{ duration: shouldReduceMotion ? 0 : 0.1, ease: 'easeIn' }}
        initial={{
          opacity: 0
        }}
        exit={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className={classNames('max-w-xl mx-auto px-2 pb-20', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
