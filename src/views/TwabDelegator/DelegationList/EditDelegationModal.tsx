import { Input } from '@components/Input'
import { Label } from '@components/Label'
import {
  BottomSheet,
  ModalTitle,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { dToMs, msToD } from '@pooltogether/utilities'
import {
  editDelegationModalOpenAtom,
  delegationIdToEditAtom,
  addDelegationUpdateAtom,
  addDelegationFundAtom,
  delegationFormDefaultsAtom,
  removeDelegationUpdateAtom,
  removeDelegationFundAtom
} from '@twabDelegator/atoms'
import { DelegationForm } from '@twabDelegator/DelegationForm'
import {
  Delegation,
  DelegationFormValues,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useForm } from 'react-hook-form'
import { useDelegationFund, useDelegationUpdate } from './ActiveState'

export const EditDelegationModal: React.FC<{ chainId: number }> = (props) => {
  const { chainId } = props
  const [isOpen, setIsOpen] = useAtom(editDelegationModalOpenAtom)
  const [delegationFormDefaults] = useAtom(delegationFormDefaultsAtom)
  const [delegationId] = useAtom(delegationIdToEditAtom)

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
      <ModalTitle chainId={chainId} title={'Edit delegation'} />
      <EditDelegationForm
        delegationFormDefaults={delegationFormDefaults}
        delegationId={delegationId}
        closeModal={() => setIsOpen(false)}
      />
    </BottomSheet>
  )
}

/**
 * @param props
 * @returns
 */
const EditDelegationForm: React.FC<{
  delegationFormDefaults: DelegationFormValues
  delegationId: DelegationId
  closeModal: () => void
}> = (props) => {
  const { delegationFormDefaults, delegationId, closeModal } = props
  const delegationUpdate = useDelegationUpdate(delegationId)
  const delegationFund = useDelegationFund(delegationId)

  const addDelegationUpdate = useUpdateAtom(addDelegationUpdateAtom)
  const addDelegationFund = useUpdateAtom(addDelegationFundAtom)
  const removeDelegationUpdate = useUpdateAtom(removeDelegationUpdateAtom)
  const removeDelegationFund = useUpdateAtom(removeDelegationFundAtom)

  // TODO: Editing a brand new delegation should update just the creation atom
  const onSubmit = (data: DelegationFormValues) => {
    const delegationUpdate: DelegationUpdate = {
      ...delegationId,
      delegatee: data.delegatee,
      lockDuration: dToMs(data.duration)
    }
    const delegationFund: DelegationFund = {
      ...delegationId,
      // TODO: Get decimals for ticket token
      amount: parseUnits(data.balance, 6)
    }

    if (
      !delegationFormDefaults.delegatee ||
      delegationFormDefaults.delegatee !== delegationUpdate.delegatee ||
      delegationUpdate.lockDuration !== 0
    ) {
      addDelegationUpdate(delegationUpdate)
    }

    const defaultAmountUnformatted = delegationFormDefaults.balance
      ? parseUnits(delegationFormDefaults.balance, 6)
      : BigNumber.from(0)
    if (!delegationFund.amount.eq(defaultAmountUnformatted)) {
      addDelegationFund(delegationFund)
    }

    closeModal()
  }

  return (
    <>
      <DelegationForm
        onSubmit={onSubmit}
        defaultValues={{
          delegatee: delegationUpdate?.delegatee || delegationFormDefaults.delegatee,
          // TODO: Convert to account for decimals
          balance: delegationFund?.amount
            ? formatUnits(delegationFund?.amount, 6)
            : delegationFormDefaults.balance,
          duration: delegationUpdate?.lockDuration
            ? msToD(delegationUpdate?.lockDuration)
            : delegationFormDefaults.duration
        }}
        submitString='Queue update'
      />
      {/* TODO: Add a "Remove delegation" button for newly created delegations */}
      {(delegationUpdate || delegationFund) && (
        <SquareButton
          className='mt-2 w-full'
          type='button'
          theme={SquareButtonTheme.orangeOutline}
          onClick={() => {
            // TODO: This is clearing ALL updates...
            delegationUpdate && removeDelegationUpdate(delegationId)
            delegationFund && removeDelegationFund(delegationId)
            closeModal()
          }}
        >
          Clear update
        </SquareButton>
      )}
    </>
  )
}
