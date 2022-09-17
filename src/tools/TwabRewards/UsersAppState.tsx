import { StyledInput } from '@components/Input'
import { SelectNetworkModal } from '@components/SelectNetworkModal'
import {
  BottomSheet,
  NetworkIcon,
  SquareButton,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { AccountAvatar, BlockExplorerLink, useUsersAddress } from '@pooltogether/wallet-connection'
import { constants } from 'ethers/lib'
import { isAddress } from 'ethers/lib/utils'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRewardsSupportedChainIds } from './hooks/useRewardsSupportedChainIds'

interface UsersAppStateProps {
  className?: string
  chainId: number
  currentAccount: string
  setChainId: (chainId: number) => void
  setCurrentAccount: (currentAccount: string) => void
}

export const UsersAppState: React.FC<UsersAppStateProps> = (props) => {
  const { className, chainId, setChainId, setCurrentAccount, currentAccount } = props

  return (
    <>
      <div className='flex items-center bg-white dark:bg-pt-purple-dark rounded-full py-2 px-4'>
        <div className='w-full flex justify-between'>
          <div className='flex space-x-2 items-center'>
            <AccountAvatar
              sizeClassName='w-4 h-4'
              address={currentAccount || constants.AddressZero}
            />
            <BlockExplorerLink
              chainId={chainId}
              address={currentAccount || constants.AddressZero}
              shorten
              noIcon
            />
            <ChangeCurrentAccountButton
              currentAccount={currentAccount}
              setCurrentAccount={setCurrentAccount}
            />
            <ClearCurrentAccountButton
              currentAccount={currentAccount}
              setCurrentAccount={setCurrentAccount}
            />
          </div>
          <RewardsNetworkSelection chainId={chainId} setChainId={setChainId} />
        </div>
      </div>
    </>
  )
}

const RewardsNetworkSelection: React.FC<{
  chainId: number
  setChainId: (chainId: number) => void
}> = (props) => {
  const { chainId, setChainId } = props
  const [isOpen, setIsOpen] = useState(false)
  const chainIds = useRewardsSupportedChainIds()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='flex items-center transition hover:opacity-80'
      >
        <NetworkIcon chainId={chainId} className='mr-2' sizeClassName='w-4 h-4' />
        <div className='flex items-center space-x-2'>
          <span className='capitalize leading-none tracking-wider text-xs'>
            {getNetworkNiceNameByChainId(chainId)}
          </span>
          <span className='text-pt-teal text-xxxs'>
            <FeatherIcon icon='settings' className='w-3 h-3' />
          </span>
        </div>
      </button>
      <SelectNetworkModal
        label='select-delegation-modal'
        isOpen={isOpen}
        description={'Select a network to manage delegations on'}
        selectedChainId={chainId}
        chainIds={chainIds}
        setSelectedChainId={setChainId}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

const ClearCurrentAccountButton: React.FC<{
  currentAccount: string
  setCurrentAccount: (currentAccount: string) => void
}> = (props) => {
  const { currentAccount, setCurrentAccount } = props
  const usersAddress = useUsersAddress()

  if (currentAccount === usersAddress) return null

  return (
    <button onClick={() => setCurrentAccount(usersAddress)}>
      <FeatherIcon icon='x' className='text-pt-red-light w-4 h-4 transition hover:opacity-70' />
    </button>
  )
}

const ChangeCurrentAccountButton: React.FC<{
  currentAccount: string
  setCurrentAccount: (currentAccount: string) => void
}> = (props) => {
  const { currentAccount, setCurrentAccount } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  if (!currentAccount) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='transition text-highlight-3 hover:text-pt-teal items-center'
      >
        <FeatherIcon icon='search' className='w-3 h-3' />
      </button>
      <ChangeAccountModal
        isOpen={isOpen}
        currentAccount={currentAccount}
        setCurrentAccount={setCurrentAccount}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

export const ChangeAccountModal: React.FC<{
  isOpen: boolean
  currentAccount: string
  setCurrentAccount: (currentAccount: string) => void
  setIsOpen: (isOpen: boolean) => void
}> = (props) => {
  const { isOpen, currentAccount, setCurrentAccount, setIsOpen } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<{ currentAccount: string }>({
    mode: 'onTouched',
    defaultValues: { currentAccount },
    shouldUnregister: true
  })

  const onSubmit = (v: { currentAccount: string }) => {
    setCurrentAccount(v.currentAccount)
    setIsOpen(false)
    reset()
  }

  return (
    <BottomSheet
      label='current-account-change-modal'
      open={isOpen}
      onDismiss={() => setIsOpen(false)}
    >
      <h6 className='text-center uppercase text-sm mb-3 mt-2 dark:text-white'>
        {t('setAccount', 'Set account')}
      </h6>
      <p className='max-w-sm mx-auto text-xs mb-8 text-center'>
        {t(
          'enterAccountAddressBelowToViewPromotions',
          "Enter an account address below to view it's promotions and rewards"
        )}
        :
      </p>
      <form
        onSubmit={handleSubmit((v) => onSubmit(v))}
        autoComplete='off'
        className='flex flex-col'
      >
        <StyledInput
          id='delegator'
          invalid={!!errors.currentAccount}
          className='w-full mb-4'
          placeholder='0xabc...'
          {...register('currentAccount', {
            required: {
              value: true,
              message: 'Account currentAccount is required'
            },
            validate: {
              isAddress: (v) => isAddress(v) || 'Invalid currentAccount'
            }
          })}
        />
        <SquareButton className='w-full' disabled={!isValid}>
          View Rewards
        </SquareButton>

        {usersAddress && currentAccount && usersAddress !== currentAccount && (
          <SquareButton
            type='button'
            className='w-full mt-4'
            theme={SquareButtonTheme.orangeOutline}
            onClick={() => {
              setCurrentAccount(usersAddress)
              setIsOpen(false)
            }}
          >
            Clear Account
          </SquareButton>
        )}
      </form>
    </BottomSheet>
  )
}
