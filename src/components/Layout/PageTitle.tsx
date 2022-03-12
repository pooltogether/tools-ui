import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export const Breadcrumbs = () => {
  const router = useRouter()

  if (router.pathname === '/') {
    return null
  }

  return (
    <Link href='/'>
      <a
        href='/'
        className='flex items-center absolute l-2 t-0 b-0 text-accent-3 font-semibold hover:text-primary opacity-70 hover:opacity-100 text-xxxs xs:text-xxs'
      >
        <FeatherIcon icon={'arrow-left-circle'} className='w-4 h-4 inline-block' />{' '}
        <span className='inline-block ml-1' style={{ paddingTop: 1 }}>
          Back
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
    <div className='relative bg-white py-4 px-4 text-center -mx-2 leading-none xs:rounded-lg mb-4 xs:mb-6'>
      <Breadcrumbs />
      <p className='mx-auto text-primary xs:text-lg'>{title || 'Apps'}</p>
    </div>
  )
}
