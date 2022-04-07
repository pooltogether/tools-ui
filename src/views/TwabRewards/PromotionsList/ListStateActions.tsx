import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'

import { ChangeDelegatorModal } from '@twabDelegator/UsersDelegationState'
import { ListState } from '.'
import { WithdrawSvg } from '@components/SvgComponents'
import { useTranslation } from 'react-i18next'

interface ListStateActionsProps {
  currentAccount: string
  transactionPending: boolean
  setListState: (listState: ListState) => void
  setCurrentAccount: (currentAccount: string) => void
}

// TODO: Cancel confirmation modal
export const ListStateActions: React.FC<ListStateActionsProps> = (props) => {
  const { transactionPending, currentAccount, setCurrentAccount, setListState } = props
  const usersAddress = useUsersAddress()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { t } = useTranslation()

  // TODO: Return a wrapper with content so we can pass classNames and style the container easier
  if (currentAccount && usersAddress !== currentAccount) {
    return (
      <FixedFooterNav>
        <div className='w-full flex justify-end'>
          <SquareButton
            className='px-8'
            size={SquareButtonSize.sm}
            disabled={transactionPending}
            onClick={() => {
              setIsOpen(true)
            }}
            theme={SquareButtonTheme.tealOutline}
          >
            {t('changeDelegator')}
          </SquareButton>
          <ChangeDelegatorModal
            isOpen={isOpen}
            currentAccount={currentAccount}
            setCurrentAccount={setCurrentAccount}
            setIsOpen={setIsOpen}
          />
        </div>
      </FixedFooterNav>
    )
  }

  return (
    <FixedFooterNav>
      <div className='w-full flex justify-center space-x-2'>
        <SquareButton
          className='w-32'
          size={SquareButtonSize.sm}
          onClick={() => setListState(ListState.withdraw)}
          disabled={transactionPending}
        >
          <div className='text-primary w-4 h-4 mr-1'>
            <WithdrawSvg />
          </div>
          {t('withdraw')}
        </SquareButton>
        <SquareButton
          className='w-24'
          size={SquareButtonSize.sm}
          onClick={() => setListState(ListState.edit)}
          disabled={transactionPending}
        >
          <FeatherIcon strokeWidth='3' icon='edit' className='w-4 h-4 mr-1' /> {t('edit')}
        </SquareButton>
      </div>
    </FixedFooterNav>
  )
}

const FixedFooterNav: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return (
    <>
      <div className='hidden xs:flex items-center justify-between w-full flex items-center justify-end mb-8'>
        {children}
      </div>
      <div className='flex xs:hidden items-center fixed b-0 l-0 r-0 h-20 bg-pt-purple-bright justify-between space-x-2 px-2'>
        {children}
      </div>
    </>
  )
}
