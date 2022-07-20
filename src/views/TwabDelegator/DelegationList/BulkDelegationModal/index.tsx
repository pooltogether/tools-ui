import { BottomSheet, ModalTitle } from '@pooltogether/react-components'
import { bulkDelegationModalOpenAtom } from '@twabDelegator/atoms'
import { ListState } from '@twabRewards/PromotionsList'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { DownloadCsv } from './DownloadCsv'
import { UploadCsv } from './UploadCsv'

export const BulkDelegationModal: React.FC<{
  chainId: number
  setListState: (listState: ListState) => void
}> = (props) => {
  const { chainId, setListState } = props
  const [isOpen, setIsOpen] = useAtom(bulkDelegationModalOpenAtom)
  const { t } = useTranslation()

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
      <ModalTitle chainId={chainId} title={t('bulkDelegation')} />
      <div className='text-xxs opacity-80 py-4'>
        Upload a CSV with delegations to create transactions to overwrite all current on chain
        delegations.
      </div>
      <div className='flex flex-col space-y-3 pt-4'>
        <div className='flex justify-between'>
          <div>
            <b className='mr-1'>1.</b>
            <span>Download the template CSV.</span>
          </div>
          <DownloadCsv />
        </div>
        <div className='flex flex-col'>
          <div>
            <b className='mr-1'>2.</b>
            <span>Edit the template.</span>
          </div>
          <div className='flex flex-col pl-4 opacity-80'>
            <span>
              <b>Delegatee</b> is the address to delegate to.
            </span>
            <span>
              <b>Lock duration</b> is the amount of time (in seconds) until the delegator or
              representative can revoke the delegation. Set this value to 0 for no lock duration.
            </span>
            <span>
              <b>Amount</b> is the amount of the token to delegate.
            </span>
          </div>
        </div>
        <div className='flex justify-between'>
          <div>
            <b className='mr-1'>3.</b>
            <span>Upload the template.</span>
          </div>
          <UploadCsv
            onUpload={() => {
              setListState(ListState.edit)
              setIsOpen(false)
            }}
          />
        </div>
      </div>
      <div className='pt-8 text-xxxs font-bold'>
        This feature is in beta and may run slow when delegating to hundreds of addresses.
      </div>
      <div className='pt-2 text-xxxs font-bold'>
        This feature may require multiple transactions. If they are not confirmed in your wallet in
        the proper order some transactions may fail.
      </div>
    </BottomSheet>
  )
}
