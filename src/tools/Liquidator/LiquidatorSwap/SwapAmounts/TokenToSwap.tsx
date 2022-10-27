import { useV5Tickets } from '@hooks/v5/useV5Tickets'
import { SwapState } from '@liquidator/constants'
import { usePrizeToken } from '@liquidator/hooks/usePrizeToken'
import { LiquidatorFormValues } from '@liquidator/interfaces'
import { Token } from '@pooltogether/hooks'
import { BottomSheet } from '@pooltogether/react-components'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { UseFormReset } from 'react-hook-form'
import { liquidatorChainIdAtom, ticketTokenAtom } from '../../atoms'
import { TokenSymbolAndIcon } from './TokenSymbolAndIcon'

const defaultClassNames = 'py-1 px-2 flex items-center space-x-2 rounded min-w-max'
const defaultColorClassNames = 'bg-pt-purple-lightest dark:bg-pt-purple-darker '

export const TokenToSwap: React.FC<{
  swapState: SwapState
  resetForm: UseFormReset<LiquidatorFormValues>
}> = (props) => {
  const { swapState, resetForm } = props
  const { t } = useTranslation()
  const [chainId] = useAtom(liquidatorChainIdAtom)
  const [ticket] = useAtom(ticketTokenAtom)
  const [isOpen, setIsOpen] = useState(false)
  const prizeToken = usePrizeToken(chainId)

  if (swapState === SwapState.prize) {
    return (
      <div className={classNames(defaultClassNames, defaultColorClassNames)}>
        <TokenSymbolAndIcon
          chainId={chainId}
          address={prizeToken?.address}
          symbol={prizeToken?.symbol}
        />
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(defaultClassNames, 'transition hover:opacity-80', {
          [defaultColorClassNames]: !!ticket,
          'bg-blue': !ticket
        })}
      >
        {ticket ? (
          <div>
            <TokenSymbolAndIcon address={ticket.address} chainId={chainId} symbol={ticket.symbol} />
          </div>
        ) : (
          <span>{t('selectAToken', 'Select a token')}</span>
        )}
        <FeatherIcon icon='chevron-down' className='w-4 h-4' />
      </button>

      <TicketSelectionModal
        chainId={chainId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        resetForm={resetForm}
      />
    </>
  )
}

const TicketSelectionModal: React.FC<{
  chainId: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  resetForm: UseFormReset<LiquidatorFormValues>
}> = (props) => {
  const { chainId, isOpen, setIsOpen, resetForm } = props
  const [selectedTicket, setSelectedTicket] = useAtom(ticketTokenAtom)
  const tickets = useV5Tickets(chainId)

  return (
    <BottomSheet
      label={'ticket-selection'}
      isOpen={isOpen}
      closeModal={() => setIsOpen(false)}
      maxWidthClassName='max-w-md'
    >
      <h6 className='text-center uppercase text-sm mb-3'>Tickets</h6>
      <p className='max-w-xs mx-auto text-xs mb-12 text-center'>
        Select a ticket to swap prize tokens for
      </p>
      <ul className='space-y-2 mx-auto max-w-sm'>
        {tickets?.map((ticket) => (
          <TicketOption
            key={ticket.address}
            chainId={chainId}
            ticket={ticket}
            isSelected={selectedTicket?.address === ticket.address}
            setSelectedTicket={setSelectedTicket}
            onClick={() => {
              resetForm()
              setIsOpen(false)
            }}
          />
        ))}
      </ul>
    </BottomSheet>
  )
}

const TicketOption: React.FC<{
  chainId: number
  ticket: Token
  isSelected: boolean
  setSelectedTicket: (ticket: Token) => void
  onClick: () => void
}> = (props) => {
  const { chainId, ticket, isSelected, setSelectedTicket, onClick } = props
  return (
    <li>
      <button
        onClick={() => {
          setSelectedTicket(ticket)
          onClick()
        }}
        className={classNames(
          'bg-pt-purple-lighter dark:bg-pt-purple-darker rounded-lg p-4 flex items-center w-full transition-colors',
          'border  hover:border-highlight-1',
          {
            'border-default': isSelected,
            'border-transparent': !isSelected
          }
        )}
      >
        <TokenSymbolAndIcon chainId={chainId} address={ticket.address} symbol={ticket.symbol} />
      </button>
    </li>
  )
}
