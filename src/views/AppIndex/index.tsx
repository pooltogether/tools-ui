import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { AppIndexList } from './AppIndexList'

export const AppIndex: React.FC = (props) => {
  return (
    <Layout>
      <PagePadding>
        <PageTitle title={'App Index'} />
        <AppIndexList />
      </PagePadding>
    </Layout>
  )
}
