import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { DelegationList } from '@twabDelegator/DelegationList'
import { DelegationTitle } from '@twabDelegator/DelegationTitle'
import { getDefaultChainId } from '@utils/getDefaultChainId'
import { useState } from 'react'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'

export const TwabDelegator: React.FC = (props) => {
  // TODO: Expand to global chain id setting like v4-ui
  const [chainId, setChainId] = useState(getDefaultChainId())

  return (
    <Layout>
      <PagePadding>
        <DelegationTitle />
        <UsersDelegationState chainId={chainId} setChainId={setChainId} />
        <DelegationList chainId={chainId} />
      </PagePadding>
    </Layout>
  )
}
