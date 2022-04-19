import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { useUpdateAtom } from 'jotai/utils'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'

import { ChangeAccountModal } from '@twabRewards/UsersAppState'
import { useTranslation } from 'react-i18next'

interface PromotionListActionsProps {
  noPromotions: boolean
  chainId: number
  currentAccount: string
  transactionPending: boolean
  setCurrentAccount: (currentAccount: string) => void
}

// TODO: Cancel confirmation modal
export const PromotionListActions: React.FC<PromotionListActionsProps> = (props) => {
  const { noPromotions, chainId, transactionPending, currentAccount, setCurrentAccount } = props
  const usersAddress = useUsersAddress()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { t } = useTranslation()

  // TODO: Return a wrapper with content so we can pass classNames and style the container easier
  if (currentAccount && usersAddress !== currentAccount) {
    return (
      <FixedFooterNav>
        <div className='w-full flex justify-center'>
          <SquareButton
            className='px-8'
            size={SquareButtonSize.sm}
            disabled={transactionPending}
            onClick={() => {
              setIsOpen(true)
            }}
            theme={SquareButtonTheme.tealOutline}
          >
            {t('changeAccount', 'Change account')}
          </SquareButton>
          <ChangeAccountModal
            isOpen={isOpen}
            currentAccount={currentAccount}
            setCurrentAccount={setCurrentAccount}
            setIsOpen={setIsOpen}
          />
        </div>
      </FixedFooterNav>
    )
  }

  if (noPromotions) {
    return null
  }

  return (
    <FixedFooterNav>
      <AddPromotionButton
        className='mx-auto xs:mt-8'
        chainId={chainId}
        currentAccount={currentAccount}
        transactionPending={transactionPending}
      />
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

const AddPromotionButton: React.FC<{
  chainId: number
  currentAccount: string
  transactionPending: boolean
  className?: string
}> = (props) => {
  const { className, transactionPending, currentAccount } = props
  const usersAddress = useUsersAddress()
  const setIsOpen = useUpdateAtom(createPromotionModalOpenAtom)
  const { t } = useTranslation()

  if (usersAddress !== currentAccount) return null

  return (
    <SquareButton
      theme={SquareButtonTheme.tealOutline}
      className={classNames('w-48', className)}
      size={SquareButtonSize.sm}
      onClick={() => {
        setIsOpen(true)
      }}
      disabled={transactionPending}
    >
      <FeatherIcon icon='plus-circle' className='w-4 h-4 my-auto mr-1' />
      <span>{t('newPromotion')}</span>
    </SquareButton>
  )
}
