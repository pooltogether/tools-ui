import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import {
  BottomSheet,
  ModalTitle,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { dToS } from '@pooltogether/utilities'
import {
  editDelegationModalOpenAtom,
  delegationIdToEditAtom,
  addDelegationUpdateAtom,
  addDelegationFundAtom,
  removeDelegationUpdateAtom,
  removeDelegationFundAtom,
  addDelegationCreationAtom,
  removeDelegationCreationAtom
} from '@twabDelegator/atoms'
import { DelegationForm } from '@twabDelegator/DelegationForm'
import { useDelegatorsUpdatedTwabDelegation } from '@twabDelegator/hooks/useDelegatorsUpdatedTwabDelegation'
import {
  DelegationFormValues,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { getDelegationFormDefaults } from '@twabDelegator/utils/getDelegationFormDefaults'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'react-i18next'

export const EditDelegationModal: React.FC<{ chainId: number }> = (props) => {
  const { chainId } = props
  const [isOpen, setIsOpen] = useAtom(editDelegationModalOpenAtom)
  const [delegationId] = useAtom(delegationIdToEditAtom)

  if (!delegationId) return null

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
      <ModalTitle chainId={chainId} title={`Edit delegation #${delegationId.slot.toString()}`} />
      <EditDelegationForm
        chainId={chainId}
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
  chainId: number
  delegationId: DelegationId
  closeModal: () => void
}> = (props) => {
  const { chainId, delegationId, closeModal } = props
  const { data: delegationData, isFetched } = useDelegatorsUpdatedTwabDelegation(
    chainId,
    delegationId
  )
  const { t } = useTranslation()
  const ticket = useV4Ticket(chainId)
  const addDelegationUpdate = useUpdateAtom(addDelegationUpdateAtom)
  const addDelegationCreation = useUpdateAtom(addDelegationCreationAtom)
  const addDelegationFund = useUpdateAtom(addDelegationFundAtom)
  const removeDelegationUpdate = useUpdateAtom(removeDelegationUpdateAtom)
  const removeDelegationCreation = useUpdateAtom(removeDelegationCreationAtom)
  const removeDelegationFund = useUpdateAtom(removeDelegationFundAtom)

  if (!isFetched || !delegationData) return null
  const delegation = delegationData?.delegation
  const delegationCreation = delegationData?.delegationCreation
  const delegationUpdate = delegationData?.delegationUpdate
  const delegationFund = delegationData?.delegationFund

  const delegationFormDefaults = getDelegationFormDefaults(
    ticket.decimals,
    delegation,
    delegationCreation,
    delegationUpdate,
    delegationFund
  )

  const onSubmit = (data: DelegationFormValues, resetForm: () => void) => {
    const delegationUpdate: DelegationUpdate = {
      ...delegationId,
      delegatee: data.delegatee,
      lockDuration: dToS(data.duration)
    }
    const delegationFund: DelegationFund = {
      ...delegationId,
      amount: parseUnits(data.balance, ticket.decimals)
    }

    if (
      !delegationFormDefaults.delegatee ||
      delegationFormDefaults.delegatee !== delegationUpdate.delegatee ||
      delegationUpdate.lockDuration !== delegationFormDefaults.duration
    ) {
      // If we're not resetting the delegation to original state, remove the edit
      if (
        !!delegation &&
        delegationUpdate.lockDuration === 0 &&
        delegation.delegatee === delegationUpdate.delegatee
      ) {
        removeDelegationUpdate(delegationId)
      }

      // If we're dealing with a creation, edit it
      else if (delegationCreation) {
        addDelegationCreation(delegationUpdate)
      } else {
        addDelegationUpdate(delegationUpdate)
      }
    }

    const defaultAmountUnformatted = delegationFormDefaults.balance
      ? parseUnits(delegationFormDefaults.balance, ticket.decimals)
      : BigNumber.from(0)

    // If we're editing a newly created slot to 0 balance, remove the fund
    if (!!delegationCreation && delegationFund.amount.isZero()) {
      removeDelegationFund(delegationId)
      // If we're setting it back to the default state
    } else if (!!delegation && delegation.balance.eq(delegationFund.amount)) {
      removeDelegationFund(delegationId)
    } else if (!delegationFund.amount.eq(defaultAmountUnformatted)) {
      addDelegationFund(delegationFund)
      // If we're setting it back to a value already stored on chain
    }

    resetForm()
    closeModal()
  }

  return (
    <>
      <DelegationForm
        key={delegationId.slot.toString()}
        chainId={chainId}
        onSubmit={onSubmit}
        defaultValues={delegationFormDefaults}
        submitString={t('queueUpdate')}
      />
      {(delegationUpdate || delegationFund || delegationCreation) && (
        <SquareButton
          className='mt-2 w-full'
          type='button'
          theme={SquareButtonTheme.orangeOutline}
          onClick={() => {
            closeModal()
            delegationUpdate && removeDelegationUpdate(delegationId)
            delegationFund && removeDelegationFund(delegationId)
            delegationCreation && removeDelegationCreation(delegationId)
          }}
        >
          {t('removeUpdate')}
        </SquareButton>
      )}
    </>
  )
}
