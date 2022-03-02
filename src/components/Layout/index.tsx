import React from 'react'
import classNames from 'classnames'

import { PageHeader } from './PageHeader'

interface LayoutProps {
  className?: string
}

/**
 * Layout component includes page header & navigation
 * @param props
 * @returns
 */
const Layout: React.FC<LayoutProps> = (props) => {
  const { children, className } = props

  return (
    <div className={classNames(className, 'min-h-screen')}>
      <PageHeader />
      {children}
    </div>
  )
}

export default Layout
