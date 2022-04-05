import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useTranslation } from 'react-i18next'
import { AppIndexList } from './AppIndexList'

export const AppIndex: React.FC = (props) => {
  const { t } = useTranslation()
  return (
    <Layout>
      <PagePadding>
        <PageTitle title={t('appIndex', 'App Index')} />
        <AppIndexList />
      </PagePadding>
    </Layout>
  )
}
