import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useTranslation } from 'react-i18next'
import { AirdropClaimDescription } from './AirdropClaimDescription'
import { AirdropClaimForm } from './AirdropClaimForm'
import { AirdropClaimSettings } from './AirdropClaimSettings'

export const AirdropClaim: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Layout>
      <PagePadding>
        <PageTitle title={t('pooltogetherAirdrop')} />
        <AirdropClaimDescription className='mb-8' />
        <AirdropClaimSettings className='mb-4' />
        <AirdropClaimForm />
      </PagePadding>
    </Layout>
  )
}
