import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { AppIndexList } from './AppIndexList'

export const AppIndex: React.FC = (props) => {
  return (
    <Layout>
      <PagePadding>
        <h1>App Index</h1>
        <AppIndexList />
      </PagePadding>
    </Layout>
  )
}
