import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useTranslation } from 'next-i18next'
import { AirdropClaimDescription } from './AirdropClaimDescription'
import { AirdropClaimForm } from './AirdropClaimForm'
import { AirdropClaimSettings } from './AirdropClaimSettings'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { LoadingScreen } from '@pooltogether/react-components'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const AirdropClaim: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('pooltogetherAirdrop')} />
          <AirdropClaimDescription className='mb-8' />
          <AirdropClaimSettings className='mb-4' />
          <AirdropClaimForm />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
