import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

interface NavLinkInfo {
  i18nKey: string
  href: string
}

const NavLinks: NavLinkInfo[] = [
  {
    i18nKey: 'deposit',
    href: '/deposit'
  },
  {
    i18nKey: 'prizes',
    href: '/prizes'
  },
  {
    i18nKey: 'account',
    href: '/account'
  }
]

const NavLink: React.FC<NavLinkInfo & { isSelected: boolean }> = (props) => {
  const { isSelected, i18nKey, href } = props
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Link
      href={{
        pathname: href,
        query: router.query
      }}
    >
      <a
        className={classNames(
          'transition',
          'text-xs hover:text-white active:bg-highlight-9',
          { 'bg-highlight-9 text-white': isSelected },
          { 'hover:opacity-60': !isSelected }
        )}
      >
        <span className={classNames({ 'text-white opacity-70 hover:opacity-100': !isSelected })}>
          {t(i18nKey)}
        </span>
      </a>
    </Link>
  )
}
