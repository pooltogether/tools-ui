import FeatherIcon from 'feather-icons-react'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import { createDelegationModalOpenAtom } from '@twabDelegator/atoms'
import { useUpdateAtom } from 'jotai/utils'
import { DelegationListProps, ListState } from '.'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { shorten } from '@pooltogether/utilities'
import { StakeSvg } from '@components/SvgComponents'
import { StakeModal } from './StakeModal'
import { useState } from 'react'

interface EmptyStateProps extends DelegationListProps {
  chainId: number
  delegator: string
  listState: ListState
  setDelegator: (delegator: string) => void
  setListState: (listState: ListState) => void
}

/**
 *
 * @param props
 * @returns
 */
export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { chainId, className, delegator, setDelegator, setListState } = props
  const { t } = useTranslation()
  const [isStakeModalOpen, setIsStakeModalOpen] = useState<boolean>(false)
  const usersAddress = useUsersAddress()
  const isUserDelegator = delegator === usersAddress

  return (
    <div
      className={classNames(
        className,
        'rounded-lg py-8 px-4 xs:px-12 text-center flex-col space-y-4 items-center bg-darkened'
      )}
    >
      <p className='text-xs font-semibold text-pt-purple-dark dark:text-pt-purple-light opacity-80'>
        {t('noDelegationsFound')}
      </p>

      {!isUserDelegator && (
        <>
          <p className='font-bold text-xs'>
            {t('userHasNoDelegations', { user: shorten({ hash: delegator }) })}
          </p>
          <button
            className='text-pt-red-light transition hover:opacity-70 flex items-center mx-auto space-x-2 border-pt-red-light border py-1 px-2 rounded'
            onClick={() => setDelegator(usersAddress)}
          >
            <span>{t('clearDelegator')}</span>
            <FeatherIcon icon='x' className='w-4 h-4' />
          </button>
        </>
      )}

      {isUserDelegator && (
        <>
          <p className='font-bold text-xs'>{t('getStartedByDelegating')}</p>
          <div className='flex flex-col mx-auto space-y-4 max-w-xs'>
            <CreateSlotButton className='w-full' setListState={setListState} />
            <SquareButton
              className='w-full'
              size={SquareButtonSize.sm}
              onClick={() => setIsStakeModalOpen(true)}
            >
              <div className='text-primary w-4 h-4 mr-1'>
                <StakeSvg />
              </div>
              {t('stake')}
            </SquareButton>
          </div>
          <StakeModal
            chainId={chainId}
            delegator={delegator}
            isOpen={isStakeModalOpen}
            closeModal={() => setIsStakeModalOpen(false)}
          />
        </>
      )}
    </div>
  )
}

const CreateSlotButton: React.FC<{
  setListState: (listState: ListState) => void
  className?: string
}> = (props) => {
  const { className, setListState } = props

  const setIsOpen = useUpdateAtom(createDelegationModalOpenAtom)
  const { t } = useTranslation()

  return (
    <SquareButton
      size={SquareButtonSize.sm}
      className={className}
      onClick={() => {
        setListState(ListState.edit)
        setIsOpen(true)
      }}
    >
      <FeatherIcon icon='plus' strokeWidth={4} className='w-4 h-4 my-auto mr-1' />
      <span>{t('newDelegation')}</span>
    </SquareButton>
  )
}
