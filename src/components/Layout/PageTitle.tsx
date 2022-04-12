import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export const Breadcrumbs = () => {
  const router = useRouter()
  const { t } = useTranslation()

  if (router.pathname === '/') {
    return null
  }

  return (
    <Link href='/'>
      <a className='flex items-center absolute l-2 t-0 b-0 font-semibold hover:opacity-100 opacity-50 text-xxxs xs:text-xxs transition'>
        <FeatherIcon icon={'arrow-left-circle'} className='w-4 h-4 inline-block' />{' '}
        <span className='inline-block ml-1' style={{ paddingTop: 1 }}>
          {t('back')}
        </span>
      </a>
    </Link>
  )
}

interface PageTitleProps {
  title: string
}

export const PageTitle = (props: PageTitleProps) => {
  const { title } = props
  return (
    <div className='relative bg-pt-purple-lightest bg-opacity-50 dark:bg-opacity-100 dark:bg-pt-purple-bright py-4 px-4 text-center -mx-2 xs:mx-0 leading-none xs:rounded-lg mb-4 xs:mb-6'>
      <Breadcrumbs />
      <p className='mx-auto xs:text-lg'>{title || 'Apps'}</p>
    </div>
  )
}
