import Layout from '@components/Layout'
import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { useEffect } from 'react'
import { UsersDelegationState } from '@twabDelegator/UsersDelegationState'
import { useAtom } from 'jotai'
import {
  delegationChainIdAtom,
  delegatorAtom,
  setDelegationChainAtom,
  setDelegatorAtom
} from '../atoms'
import { useUpdateAtom } from 'jotai/utils'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { BulkDelegationDescription } from './BulkDelegationDescription'
import { BulkTwabDelegationSteps } from './BulkTwabDelegationSteps'
import { LockedDelegationsWarning } from './LockedDelegationsWarning'

// TODO: Go to confirmation modal while wallet is on wrong network. Switch networks. Lotsa problems.
export const BulkTwabDelegator: React.FC = () => {
  const [chainId] = useAtom(delegationChainIdAtom)
  const [delegator] = useAtom(delegatorAtom)
  const setChainId = useUpdateAtom(setDelegationChainAtom)
  const usersAddress = useUsersAddress()
  const setDelegator = useUpdateAtom(setDelegatorAtom)
  const { t } = useTranslation()

  // Lazy way to get the app to react on wallet connection
  useEffect(() => {
    if (!delegator) {
      setDelegator(usersAddress)
    }
  }, [usersAddress])

  return (
    <Layout>
      <PagePadding>
        <PageTitle title={t('bulkDepositDelegator', 'Bulk deposit delegator') + ' (beta)'} />
        <BulkDelegationDescription className='mb-8' />
        <UsersDelegationState
          chainId={chainId}
          delegator={delegator}
          setDelegator={setDelegator}
          setChainId={setChainId}
          className='mb-8'
        />
        <LockedDelegationsWarning chainId={chainId} delegator={delegator} />
        <BulkTwabDelegationSteps />
      </PagePadding>
    </Layout>
  )
}
