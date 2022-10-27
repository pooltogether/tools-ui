import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { createPromotionModalOpenAtom } from '@twabRewards/atoms'
import { ChangeAccountModal } from '@twabRewards/UsersAppState'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

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
          <Button
            className='px-8'
            size={ButtonSize.sm}
            disabled={transactionPending}
            onClick={() => {
              setIsOpen(true)
            }}
            theme={ButtonTheme.tealOutline}
          >
            {t('changeAccount', 'Change account')}
          </Button>
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
        className='mx-auto'
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
      {/* Desktop */}
      <div className='hidden xs:flex w-full items-center justify-between mb-8'>{children}</div>
      {/* Mobile */}
      <div className='flex xs:hidden items-center fixed b-0 l-0 r-0 h-20 bg-pt-purple-bright justify-between space-x-2 px-2 z-10'>
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
    <Button
      theme={ButtonTheme.tealOutline}
      className={classNames('w-48', className)}
      size={ButtonSize.sm}
      onClick={() => {
        setIsOpen(true)
      }}
      disabled={transactionPending}
    >
      <FeatherIcon icon='plus-circle' className='w-4 h-4 my-auto mr-1' />
      <span>{t('newPromotion')}</span>
    </Button>
  )
}
