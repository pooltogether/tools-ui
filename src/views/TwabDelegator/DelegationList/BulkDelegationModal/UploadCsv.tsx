import { dToS, getReadProvider } from '@pooltogether/utilities'
import {
  addDelegationCreationAtom,
  addDelegationFundAtom,
  addDelegationUpdateAtom,
  delegationChainIdAtom,
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatesAtom,
  delegatorAtom
} from '@twabDelegator/atoms'
import { DelegationFormValues, DelegationFund, DelegationUpdate } from '@twabDelegator/interfaces'
import { BigNumber, constants, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import FeatherIcon from 'feather-icons-react'
import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import classNames from 'classnames'

export const UploadCsv: React.FC<{ onUpload?: (rows: DelegationFormValues[]) => void }> = (
  props
) => {
  const { onUpload } = props

  const [chainId] = useAtom(delegationChainIdAtom)
  const [delegator] = useAtom(delegatorAtom)
  const ticket = useV4Ticket(chainId)
  const [, setDelegationCreations] = useAtom(delegationCreationsAtom)
  const [, setDelegationUpdates] = useAtom(delegationUpdatesAtom)
  const [, setDelegationFunds] = useAtom(delegationFundsAtom)
  const { data: delegations, isFetched } = useDelegatorsTwabDelegations(chainId, delegator)

  useEffect(() => {
    const p = getReadProvider(chainId)
    console.log({ p, ethers })
  }, [])

  // TODO: Handle attempts to overwrite locked delegations
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

      if (isSlotInUse) {
        delegationUpdates.push(delegationUpdate)
      } else {
        delegationCreations.push(delegationUpdate)
      }
      delegationFunds.push(delegationFund)
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

    setDelegationCreations(delegationCreations.slice(0, 500))
    setDelegationUpdates(delegationUpdates)
    setDelegationFunds(delegationFunds)
  }

  return (
    <div className='flex flex-col'>
      <label
        htmlFor='csv-upload'
        className={classNames(
          'square-btn square-btn--teal square-btn--sm flex items-center justify-center space-x-1',
          { 'opacity-70 cursor-not-allowed': !isFetched }
        )}
      >
        <FeatherIcon icon='upload' className='w-4 h-4' />
        <div>Upload CSV</div>
        <input
          id='csv-upload'
          className='hidden'
          type='file'
          accept='.csv'
          onChange={async (event) => {
            if (event.target?.files?.item(0)) {
              const file = event.target.files.item(0)
              const fileContents = await file.text()
              const { rows } = parseCsv(fileContents)
              updateOrCreateDelegations(rows)
              onUpload?.(rows)
            }
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
      if (rowData.length === 3) {
        return {
          delegatee: rowData[0],
          duration: Number(rowData[1]),
          balance: rowData[2]
        }
      }
    })
    .filter(Boolean)

  return { headers, rows }
}
