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
      <div className='flex flex-col space-y-2'>
        <div>
          <span>1.</span>
          <span>Download the template</span>
        </div>
        <DownloadCsv />
        <div>
          <span>2.</span>
          <span>Edit the template</span>
        </div>
        <div>
          <span>3.</span>
          <span>Upload the template</span>
        </div>
        <UploadCsv
          onUpload={() => {
            setListState(ListState.edit)
            setIsOpen(false)
          }}
        />
      </div>
    </BottomSheet>
  )
}
