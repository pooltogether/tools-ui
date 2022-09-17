import { TransactionState, useTransaction } from '@pooltogether/wallet-connection'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import { CreatePromotionModal } from '@twabRewards/CreatePromotionModal'
import { useAccountsPromotions } from '@twabRewards/hooks/useAccountsPromotions'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { ActiveState } from './ActiveState'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { NoAccountState } from './NoAccountState'
import { PromotionListActions } from './PromotionListActions'

export interface PromotionsListProps {
  className?: string
  chainId: number
  currentAccount: string
  setCurrentAccount: (currentAccount: string) => void
}

export enum ListState {
  readOnly = 'READ_ONLY',
  edit = 'EDIT',
  withdraw = 'WITHDRAW'
}

/**
 *
 * @returns
 */
export const PromotionsList: React.FC<PromotionsListProps> = (props) => {
  const { chainId, currentAccount, className, setCurrentAccount } = props

  const [isOpen] = useAtom(createPromotionModalOpenAtom)

  const useQueryResult = useAccountsPromotions(chainId, currentAccount)
  const [transactionId, setTransactionId] = useState<string>()
  const transaction = useTransaction(transactionId)
  const [signaturePending, setSignaturePending] = useState(false)

  const transactionPending = transaction?.state === TransactionState.pending || signaturePending
  const { data: promotionsData, isFetched, refetch: refetchAccountsPromotions } = useQueryResult

  if (isFetched) {
    let list
    if (!promotionsData?.promotions) {
      list = (
        <div className='text-center'>
          An error was encountered while fetching promotions from the subgraph.
        </div>
      )
    } else if (promotionsData?.promotions?.length === 0) {
      list = <EmptyState {...props} className='mb-10' currentAccount={currentAccount} />
    } else {
      list = <ActiveState {...props} className='mb-10' currentAccount={currentAccount} />
    }

    return (
      <div className={classNames(className, 'text-xxxs xs:text-xs')}>
        <p className='text-center text-xs xs:text-sm uppercase font-semibold text-pt-purple-light mt-8 mb-2 xs:mb-2 xs:mt-8'>
          Promotions
        </p>
        {!isOpen && (
          <PromotionListActions
            noPromotions={promotionsData?.promotions?.length === 0}
            chainId={chainId}
            currentAccount={currentAccount}
            setCurrentAccount={setCurrentAccount}
            transactionPending={transactionPending}
          />
        )}

        <div>{list}</div>

        <CreatePromotionModal
          chainId={chainId}
          transactionId={transactionId}
          transactionPending={transactionPending}
          setTransactionId={setTransactionId}
          // setSignaturePending={setSignaturePending}
          refetchAccountsPromotions={refetchAccountsPromotions}
        />
      </div>
    )
  } else {
    if (!currentAccount) {
      return <NoAccountState {...props} />
    }
    return <LoadingState {...props} />
  }
}
