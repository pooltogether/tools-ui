import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

export const BulkDelegationDescription: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'flex flex-col text-accent-1 space-y-2')}>
      <p className='text-xxs'>
        Upload a CSV with delegations to create transactions to overwrite all current on chain
        delegations.
      </p>
      <p className='text-xxs'>
        Bulk delegation may require multiple transactions. If they are not confirmed in your wallet
        in the proper order some transactions may fail.
      </p>
      <p className='text-xxs'>
        This feature is in beta and may run slow when delegating to hundreds of addresses.
      </p>
    </div>
  )
}
