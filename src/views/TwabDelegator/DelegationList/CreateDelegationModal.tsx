import { BottomSheet, ModalTitle } from '@pooltogether/react-components'
import { dToMs } from '@pooltogether/utilities'
import {
  addDelegationFundAtom,
  addDelegationCreationAtom,
  createDelegationModalOpenAtom
} from '@twabDelegator/atoms'
import { DelegationForm } from '@twabDelegator/DelegationForm'
import { useNextSlot } from '@twabDelegator/hooks/useNextSlot'
import {
  DelegationFormValues,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'

export const CreateDelegationModal: React.FC<{
  chainId: number
  delegator: string
}> = (props) => {
  const { chainId, delegator } = props
  const [isOpen, setIsOpen] = useAtom(createDelegationModalOpenAtom)
  const nextSlotId = useNextSlot(chainId, delegator)

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
      <ModalTitle chainId={chainId} title={'Create delegation'} />
      <CreateDelegationForm
        delegationId={{
          slot: nextSlotId,
          delegator
        }}
        closeModal={() => setIsOpen(false)}
      />
    </BottomSheet>
  )
}

/**
 * @param props
 * @returns
 */
const CreateDelegationForm: React.FC<{
  delegationId: DelegationId
  closeModal: () => void
}> = (props) => {
  const { delegationId, closeModal } = props

  const addDelegationCreation = useUpdateAtom(addDelegationCreationAtom)
  const addDelegationFund = useUpdateAtom(addDelegationFundAtom)

  const onSubmit = (data: DelegationFormValues) => {
    const delegationCreation: DelegationUpdate = {
      ...delegationId,
      delegatee: data.delegatee,
      lockDuration: dToMs(data.duration)
    }
    const delegationFund: DelegationFund = {
      ...delegationId,
      // TODO: Get decimals for ticket token
      amount: parseUnits(data.balance, 6)
    }

    addDelegationCreation(delegationCreation)
    if (!delegationFund.amount.isZero()) {
      addDelegationFund(delegationFund)
    }

    closeModal()
  }

  return (
    <DelegationForm
      onSubmit={onSubmit}
      defaultValues={{
        delegatee: '',
        balance: '',
        duration: 0
      }}
      submitString='Queue Creation'
    />
  )
}
