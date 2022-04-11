import { useTicket } from '@hooks/v4/useTicket'
import { BottomSheet, BottomSheetTitle } from '@pooltogether/react-components'
import { dToS } from '@pooltogether/utilities'
import {
  addDelegationFundAtom,
  addDelegationCreationAtom,
  createPromotionModalOpenAtom
} from '@twabRewards/atoms'
import { PromotionForm } from '@twabRewards/PromotionForm'
// import { useNextSlot } from '@twabRewards/hooks/useNextSlot'
import {
  PromotionFormValues,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabRewards/interfaces'
import { parseUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'react-i18next'

export const CreatePromotionModal: React.FC<{
  chainId: number
  currentAccount: string
}> = (props) => {
  const { chainId, currentAccount } = props
  const [isOpen, setIsOpen] = useAtom(createPromotionModalOpenAtom)
  // const nextSlotId = useNextSlot(chainId, currentAccount)
  const { t } = useTranslation()

  return (
    <BottomSheet label='delegation-edit-modal' open={isOpen} onDismiss={() => setIsOpen(false)}>
      <BottomSheetTitle chainId={chainId} title={t('createPromotion', 'Create promotion')} />
      <CreatePromotionForm
        chainId={chainId}
        delegationId={{
          // slot: nextSlotId,
          slot: 1,
          currentAccount
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
const CreatePromotionForm: React.FC<{
  chainId: number
  currentAccount: DelegationId
  closeModal: () => void
}> = (props) => {
  const { chainId, currentAccount, closeModal } = props
  const ticket = useTicket(chainId)
  const { t } = useTranslation()

  const addDelegationCreation = useUpdateAtom(addDelegationCreationAtom)
  const addDelegationFund = useUpdateAtom(addDelegationFundAtom)

  const onSubmit = (data: PromotionFormValues, resetForm: () => void) => {
    // const delegationCreation: DelegationUpdate = {
    //   ...currentAccount,
    //   delegatee: data.delegatee,
    //   lockDuration: dToS(data.duration)
    // }
    // const delegationFund: DelegationFund = {
    //   ...delegationId,
    //   amount: parseUnits(data.balance, ticket.decimals)
    // }
    // addDelegationCreation(delegationCreation)
    // if (!delegationFund.amount.isZero()) {
    //   addDelegationFund(delegationFund)
    // }
    // resetForm()
    // closeModal()
  }

  return (
    <PromotionForm
      chainId={chainId}
      onSubmit={onSubmit}
      defaultValues={{
        token: '',
        startTimestamp: Date.now(),
        epochDuration: 0,
        numberOfEpochs: 0,
        tokensPerEpoch: 0
      }}
      submitString={t('queueCreation')}
    />
  )
}
