import { Banner, BannerTheme, BottomSheet, ModalTitle } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import {
  delegationCreationsCountAtom,
  delegationFundsAtom,
  delegationFundsCountAtom,
  delegationUpdatedLocksCountAtom,
  delegationUpdatesCountAtom,
  delegationUpdatesModalOpenAtom
} from '@twabDelegator/atoms'
import { useAtom } from 'jotai'
import { DelegationConfirmationList } from './DelegationConfirmationList'
import { useEffect, useState } from 'react'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useTokenAllowance, useTokenBalance } from '@pooltogether/hooks'
import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TransactionButton } from '@components/Buttons/TransactionButton'
import { useIsDelegatorsBalanceSufficient } from '@twabDelegator/hooks/useIsDelegatorsBalanceSufficient'
import { getPoolTogetherDepositUrl } from '@utils/getPoolTogetherDepositUrl'
import { DELEGATION_LEARN_MORE_URL } from '@twabDelegator/constants'
import {
  TransactionState,
  TransactionStatus,
  useTransaction,
  useTransactions,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { useIsUserDelegatorsRepresentative } from '@twabDelegator/hooks/useIsUserDelegatorsRepresentative'
import { useDelegatorsStake } from '@twabDelegator/hooks/useDelegatorsStake'
import { useIsDelegatorsStakeSufficient } from '@twabDelegator/hooks/useIsDelegatorsStakeSufficient'
import { useSigner } from 'wagmi'
import { EditedIconAndCount } from './ListStateActions'
import { useSubmitUpdateDelegationTransaction } from '@twabDelegator/hooks/useSubmitUpdateDelegationTransaction'
import { useResetDelegationAtoms } from '@twabDelegator/hooks/useResetDelegationAtoms'
import { useDelegatorsTwabDelegations } from '@twabDelegator/hooks/useDelegatorsTwabDelegations'
import { useTotalAmountDelegated } from '@twabDelegator/hooks/useTotalAmountDelegated'

enum ConfirmModalState {
  review = 'REVIEW',
  receipt = 'RECEIPT'
}

/**
 * TODO: Show users Ticket balance after the update goes through: 526.12 PTaUSDC - (100 PTaUSDC in update)
 * @param props
 * @returns
 */
export const ConfirmUpdatesModal: React.FC<{
  chainId: number
  delegator: string
  transactionId: string
  transactionsPending: boolean
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (transactionIds: string) => void
  onSuccess?: () => void
}> = (props) => {
  const {
    chainId,
    delegator,
    transactionId,
    transactionsPending,
    setSignaturePending,
    onSuccess: _onSuccess,
    setTransactionId
  } = props
  const [editsCount] = useAtom(delegationUpdatesCountAtom)
  const [creationsCount] = useAtom(delegationCreationsCountAtom)
  const [fundsCount] = useAtom(delegationFundsCountAtom)
  const [modalState, setModalState] = useState(ConfirmModalState.review)
  const [isOpen, setIsOpen] = useAtom(delegationUpdatesModalOpenAtom)
  const transaction = useTransaction(transactionId)
  const { t } = useTranslation()
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const isBalanceSufficient = useIsDelegatorsBalanceSufficient(chainId, delegator, delegationFunds)
  const isStakeSufficient = useIsDelegatorsStakeSufficient(chainId, delegator, delegationFunds)
  const usersAddress = useUsersAddress()
  const { data: isUserARepresentative, isFetched: isRepresentativeFetched } =
    useIsUserDelegatorsRepresentative(chainId, usersAddress, delegator)
  const resetAtoms = useResetDelegationAtoms()
  const { refetch } = useDelegatorsTwabDelegations(chainId, delegator)
  const ticket = useV4Ticket(chainId)
  const { refetch: refetchDelegationBalance } = useTotalAmountDelegated(chainId, delegator)
  const { refetch: refetchTicketBalance } = useTokenBalance(chainId, delegator, ticket.address)
  const { refetch: refetchStake } = useDelegatorsStake(chainId, delegator)

  const onSuccess = () => {
    refetch()
    resetAtoms()
    refetchDelegationBalance()
    refetchStake()
    refetchTicketBalance()
    setIsOpen(false)
    setModalState(ConfirmModalState.review)
    setTransactionId('')
    _onSuccess?.()
  }

  let content
  if (modalState === ConfirmModalState.review) {
    content = (
      <div className='flex flex-col space-y-4'>
        <ModalTitle chainId={chainId} title={t('delegationConfirmation')} />
        {isRepresentativeFetched && !isUserARepresentative && (
          <TicketBalanceWarning chainId={chainId} isBalanceSufficient={isBalanceSufficient} />
        )}
        {isRepresentativeFetched && isUserARepresentative && (
          <TicketStakeWarning chainId={chainId} isStakeSufficient={isStakeSufficient} />
        )}
        <DelegationLockWarning />

        <div>
          <div className='mb-1 flex justify-between'>
            <p className='text-xs font-bold capitalize'>{t('reviewChanges')}</p>
            <div className='flex flex-row space-x-2'>
              <EditedIconAndCount
                count={creationsCount}
                icon='plus-circle'
                tooltipText={t('createSlot')}
              />
              <EditedIconAndCount
                count={fundsCount}
                icon='dollar-sign'
                tooltipText={t('fundDelegatee')}
              />
              <EditedIconAndCount
                count={editsCount}
                icon='edit-2'
                tooltipText={t('editDelegatee')}
              />
            </div>
          </div>
          <DelegationConfirmationList chainId={chainId} delegator={delegator} />
        </div>
        <SubmitTransactionButton
          chainId={chainId}
          delegator={delegator}
          transactionsPending={transactionsPending}
          isBalanceSufficient={isBalanceSufficient}
          isStakeSufficient={isStakeSufficient}
          isUserARepresentative={isUserARepresentative}
          isRepresentativeFetched={isRepresentativeFetched}
          setIsOpen={setIsOpen}
          setTransactionId={setTransactionId}
          onSuccess={onSuccess}
          setModalState={setModalState}
          setSignaturePending={setSignaturePending}
        />
      </div>
    )
  } else {
    content = (
      <div className='flex flex-col space-y-12'>
        <ModalTitle chainId={chainId} title={t('delegationTransactionSubmitted')} />
        <TransactionReceiptButton
          key={transaction?.id}
          chainId={chainId}
          transaction={transaction}
        />
      </div>
    )
  }

  return (
    <BottomSheet
      label='delegation-edit-modal'
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false)
        if (!transactionsPending) {
          setModalState(ConfirmModalState.review)
        }
      }}
    >
      {content}
    </BottomSheet>
  )
}

/**
 *
 * @returns
 */
const DelegationLockWarning: React.FC = () => {
  const [lockCount] = useAtom(delegationUpdatedLocksCountAtom)
  const { t } = useTranslation()

  if (!lockCount) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-yellow' />
      <p className='text-xs'>{t('delegationConfirmationDescription')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMoreAboutDepositDelegation')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

const TicketBalanceWarning: React.FC<{ isBalanceSufficient: boolean; chainId: number }> = (
  props
) => {
  const { isBalanceSufficient, chainId } = props
  const { t } = useTranslation()

  if (isBalanceSufficient === null || isBalanceSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>{t('delegatedAmountTooLarge')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={getPoolTogetherDepositUrl(chainId)}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('depositMore')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

const TicketStakeWarning: React.FC<{ isStakeSufficient: boolean; chainId: number }> = (props) => {
  const { isStakeSufficient } = props
  const { t } = useTranslation()

  if (isStakeSufficient === null || isStakeSufficient) return null

  return (
    <Banner
      theme={BannerTheme.rainbowBorder}
      innerClassName='flex flex-col items-center text-center space-y-2 text-xs'
    >
      <FeatherIcon icon='alert-triangle' className='text-pt-red-light' />
      <p className='text-xs'>{t('delegatedAmountTooLargeForStake')}</p>
      <a
        className='transition text-pt-teal hover:opacity-70 underline flex items-center space-x-1'
        href={DELEGATION_LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{t('learnMoreAboutDepositDelegation')}</span>
        <FeatherIcon icon='external-link' className='w-3 h-3' />
      </a>
    </Banner>
  )
}

interface SubmitTransactionButtonProps {
  chainId: number
  delegator: string
  transactionsPending: boolean
  isBalanceSufficient: boolean
  isStakeSufficient: boolean
  isUserARepresentative: boolean
  isRepresentativeFetched: boolean
  onSuccess: () => void
  setIsOpen: (isOpen: boolean) => void
  setSignaturePending: (pending: boolean) => void
  setTransactionId: (id: string) => void
  setModalState: (modalState: ConfirmModalState) => void
}

/**
 * https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    delegator,
    transactionsPending,
    isBalanceSufficient,
    isStakeSufficient,
    isUserARepresentative,
    isRepresentativeFetched,
    onSuccess,
    setSignaturePending,
    setModalState,
    setTransactionId
  } = props
  const { data: signer } = useSigner()
  const usersAddress = useUsersAddress()
  const ticket = useV4Ticket(chainId)

  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { isFetched: isAllowanceFetched } = useTokenAllowance(
    chainId,
    usersAddress,
    twabDelegatorAddress,
    ticket.address
  )
  const { isFetched: isStakeFetched } = useDelegatorsStake(chainId, delegator)
  const { t } = useTranslation()

  const submit = useSubmitUpdateDelegationTransaction(setTransactionId, setSignaturePending, {
    onConfirmedByUser: () => setModalState(ConfirmModalState.receipt),
    onSuccess
  })

  return (
    <TransactionButton
      className='w-full'
      onClick={submit}
      disabled={
        !signer ||
        !isAllowanceFetched ||
        transactionsPending ||
        (!isUserARepresentative && !isBalanceSufficient) ||
        (isUserARepresentative && !isStakeSufficient) ||
        !isRepresentativeFetched ||
        (isUserARepresentative && !isStakeFetched)
      }
      pending={transactionsPending}
      chainId={chainId}
    >
      {t('confirmUpdates')}
    </TransactionButton>
  )
}
