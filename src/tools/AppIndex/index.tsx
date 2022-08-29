import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useTranslation } from 'react-i18next'
import { AppIndexList } from './AppIndexList'
import { CommunityAppIndexList } from './CommunityAppIndexList'

export const AppIndex: React.FC = (props) => {
  const { t } = useTranslation()
  return (
    <Layout>
      <PagePadding className='space-y-4' maxWidthClassName='max-w-screen-lg'>
        <PageTitle title={t('tools', 'Tools')} />
        <div className='leading-tight pt-4'>
          <p className='font-bold mb-2'>{t('poolTogetherTools', 'PoolTogether Tools')}</p>
          <p className='text-xxs sm:text-sm opacity-75'>
            {t(
              'poolTogetherToolsDescription',
              'A collection of dapps built on top of the core PoolTogether protocol.'
            )}
          </p>
        </div>
        <AppIndexList />
        <div className='leading-tight pt-4'>
          <p className='font-bold mb-2'>{t('communityToolsTitle', 'Community Tools')}</p>
          <p className='text-xxs sm:text-sm opacity-75'>
            {t(
              'communityToolsDescription',
              'Tools built by the PoolTogether community for the PoolTogether community.'
            )}
          </p>
        </div>
        <CommunityAppIndexList />
      </PagePadding>
    </Layout>
  )
}
