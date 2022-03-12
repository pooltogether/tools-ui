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
        className='flex items-center absolute l-2 text-accent-3 font-semibold hover:text-primary'
        style={{ paddingTop: 2 }}
      >
        <FeatherIcon icon={'arrow-left-circle'} className='w-4 h-4 inline-block' />{' '}
        <span className='inline-block text-xxs ml-1' style={{ paddingTop: 1 }}>
          Back
        </span>
      </a>
    </Link>
  )
}

export const PageTitle = () => {
  return (
    <div className='relative bg-white py-4 px-4 text-center -mx-2 leading-none xs:rounded-lg'>
      <Breadcrumbs />
      <h4 className='w-32 mx-auto text-primary' style={{ fontSize: 20 }}>
        Apps
      </h4>
    </div>
  )
}
