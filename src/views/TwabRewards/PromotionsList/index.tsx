import { useState } from 'react'
import classNames from 'classnames'
import { TransactionState, useTransaction } from '@pooltogether/wallet-connection'

import { ActiveState } from './ActiveState'
import { EmptyState } from './EmptyState'
import { ListStateActions } from './ListStateActions'
import { LoadingState } from './LoadingState'
// import { EditPromotionModal } from './EditPromotionModal'
// import { ConfirmUpdatesModal } from './ConfirmUpdatesModal'
// import { CreatePromotionModal } from './CreatePromotionModal'
import { useAccountsUpdatedPromotions } from '@twabRewards/hooks/useAccountsUpdatedPromotions'
// import { useResetPromotionAtomsOnAccountChange } from '@twabRewards/hooks/useResetPromotionAtomsOnAccountChange'
import { NoAccountState } from './NoAccountState'

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
  // useResetPromotionAtomsOnAccountChange()
  const useQueryResult = useAccountsUpdatedPromotions(chainId, currentAccount)
  const [listState, setListState] = useState<ListState>(ListState.readOnly)
  const [transactionId, setTransactionId] = useState<string>()
  const transaction = useTransaction(transactionId)
  const [signaturePending, setSignaturePending] = useState(false)

  const transactionPending = transaction?.state === TransactionState.pending || signaturePending
  const { data: promotions, isFetched } = useQueryResult
  console.log({ promotions, transactionPending })

  console.log({ currentAccount })
  if (isFetched) {
    let list
    if (promotions.length === 0) {
      console.log('in')
      list = (
        <EmptyState
          {...props}
          className='mb-10'
          currentAccount={currentAccount}
          listState={listState}
          setListState={setListState}
        />
      )
    } else {
      console.log('here')
      console.log(promotions)

      list = (
        <ActiveState
          {...props}
          className='mb-10'
          currentAccount={currentAccount}
          listState={listState}
          setListState={setListState}
          transactionPending={transactionPending}
        />
      )
    }

    return (
      <div className={classNames(className, 'text-xxxs xs:text-xs')}>
        <p className='text-center text-xs xs:text-sm uppercase font-semibold text-pt-purple-light mt-8 mb-2 xs:mb-2 xs:mt-2'>
          Promotions
        </p>
        {/* 
        {promotions.length >= 1 && (
          <ListStateActions
            chainId={chainId}
            listState={listState}
            currentAccount={currentAccount}
            setCurrentAccount={setCurrentAccount}
            setListState={setListState}
            transactionPending={transactionPending}
          />
        )} */}

        <div className='xs:mx-2'>{list}</div>

        {/* <EditPromotionModal chainId={chainId} />
        <CreatePromotionModal chainId={chainId} currentAccount={currentAccount} />
        <ConfirmUpdatesModal
          chainId={chainId}
          currentAccount={currentAccount}
          transactionId={transactionId}
          transactionPending={transactionPending}
          setSignaturePending={setSignaturePending}
          setTransactionId={setTransactionId}
          setListState={setListState}
        /> */}
      </div>
    )
  } else {
    if (!currentAccount) {
      return <NoAccountState {...props} />
    }
    return <LoadingState {...props} />
  }
}
