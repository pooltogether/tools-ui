import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import { dToS } from '@pooltogether/utilities'
import { useIsWalletConnected } from '@pooltogether/wallet-connection'
import {
  delegationChainIdAtom,
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatesAtom,
  delegatorAtom
} from '@twabDelegator/atoms'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useIsADelegationLocked } from '@twabDelegator/hooks/useIsADelegationLocked'
import { DelegationFormValues, DelegationFund, DelegationUpdate } from '@twabDelegator/interfaces'
import classNames from 'classnames'
import { BigNumber, constants } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import FeatherIcon from 'feather-icons-react'
import { useAtom } from 'jotai'
import { useState } from 'react'

export const UploadCsv: React.FC<{
  setCsvUpdates: (updates: {
    delegationUpdates: DelegationUpdate[]
    delegationCreations: DelegationUpdate[]
    delegationFunds: DelegationFund[]
  }) => void
  onUpload?: (rows: DelegationFormValues[]) => void
}> = (props) => {
  const { onUpload, setCsvUpdates } = props

  const isWalletConnected = useIsWalletConnected()
  const [chainId] = useAtom(delegationChainIdAtom)
  const [delegator] = useAtom(delegatorAtom)
  const ticket = useV4Ticket(chainId)
  const [isUploading, setIsUploading] = useState(false)
  const { data: delegations, isFetched } = useDelegatorsTwabDelegations(chainId, delegator)
  const isDelegationsLocked = useIsADelegationLocked(chainId, delegator)

  /**
   * Builds all of the data objects that need to be submitted in transactions to overwrite the state of delegations
   * TODO: Handle attempts to overwrite locked delegations
   * @param bulkDelegations
   */
  const updateOrCreateDelegations = (bulkDelegations: DelegationFormValues[]) => {
    const delegationCreations: DelegationUpdate[] = []
    const delegationUpdates: DelegationUpdate[] = []
    const delegationFunds: DelegationFund[] = []

    bulkDelegations.map((delegation, index) => {
      const slot = BigNumber.from(index)
      const delegationUpdate: DelegationUpdate = {
        slot,
        delegator,
        delegatee: delegation.delegatee,
        lockDuration: dToS(delegation.duration)
      }
      const delegationFund: DelegationFund = {
        slot,
        delegator,
        amount: parseUnits(delegation.balance, ticket.decimals)
      }

      const isSlotInUse = delegations.find(({ delegationId }) => delegationId.slot.eq(slot))

      if (!!isSlotInUse) {
        if (isSlotInUse.delegation.delegatee !== delegationUpdate.delegatee) {
          delegationUpdates.push(delegationUpdate)
        }
      } else {
        delegationCreations.push(delegationUpdate)
      }

      const amountToDelegate = parseUnits(delegation.balance, ticket.decimals)
      if (!amountToDelegate.isZero()) {
        if (!isSlotInUse || !isSlotInUse.delegation.balance.eq(amountToDelegate)) {
          delegationFunds.push(delegationFund)
        }
      }
    })

    // Clear any existing delegations
    delegations.map((delegation) => {
      if (
        !delegationUpdates.find((delegationUpdate) =>
          delegationUpdate.slot.eq(delegation.delegationId.slot)
        )
      ) {
        delegationFunds.push({
          ...delegation.delegationId,
          amount: constants.Zero
        })
      }
    })

    setCsvUpdates({
      delegationCreations,
      delegationUpdates,
      delegationFunds
    })
  }

  const disabled =
    !isFetched ||
    isUploading ||
    !isWalletConnected ||
    isDelegationsLocked === null ||
    isDelegationsLocked

  return (
    <div className={classNames('flex flex-col', { 'cursor-not-allowed': disabled })}>
      <label
        htmlFor='csv-upload'
        className={classNames(
          'square-btn square-btn--sm flex items-center justify-center space-x-1',
          {
            'bg-pt-purple-darkest text-pt-purple-light pointer-events-none border-transparent':
              disabled,
            'square-btn--teal': !disabled
          }
        )}
      >
        {isUploading ? (
          <ThemedClipSpinner sizeClassName='w-3 h-3' className='mr-1' />
        ) : (
          <FeatherIcon icon='upload' className='w-4 h-4' />
        )}
        <div>{isUploading ? 'Uploading CSV' : 'Upload CSV'}</div>
        <input
          id='csv-upload'
          className='hidden'
          type='file'
          accept='.csv'
          onChange={async (event) => {
            setIsUploading(true)
            if (event.target?.files?.item(0)) {
              const file = event.target.files.item(0)
              const fileContents = await file.text()
              const { rows } = parseCsv(fileContents)
              updateOrCreateDelegations(rows)
              onUpload?.(rows)
            }
            setIsUploading(false)
          }}
        />
      </label>
    </div>
  )
}

const parseCsv = (unformattedCsv: string) => {
  const formattedCsv = unformattedCsv.replace(/\r\n/g, '\n').replace(/\r/, '\n')
  const headers = formattedCsv.slice(0, formattedCsv.indexOf('\n')).split(',')
  const rows = formattedCsv
    .slice(formattedCsv.indexOf('\n') + 1)
    .split('\n')
    .map((row) => {
      const rowData = row.split(',')
      if (rowData.length === 2) {
        return {
          delegatee: rowData[0],
          duration: 0,
          balance: rowData[1]
        }
      }
    })
    .filter(Boolean)

  return { headers, rows }
}
