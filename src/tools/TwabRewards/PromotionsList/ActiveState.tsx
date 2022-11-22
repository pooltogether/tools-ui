import { Tooltip } from '@pooltogether/react-components'
import { useAccountsPromotions } from '@twabRewards/hooks/useAccountsPromotions'
import { Promotion } from '@twabRewards/interfaces'
import { PromotionSummary } from '@twabRewards/PromotionSummary'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { PromotionsListProps } from '.'
import { EditPromotionModal } from './EditPromotionModal'

export interface ActiveStateProps extends PromotionsListProps {
  currentAccount: string
}

/**
 * @param props
 * @returns
 */
export const ActiveState: React.FC<ActiveStateProps> = (props) => {
  const { chainId, className, currentAccount } = props
  const { data: promotionsData } = useAccountsPromotions(chainId, currentAccount)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion>()

  const { promotions } = promotionsData || {}

  return (
    <>
      <div className={classNames(className, 'flex flex-col pb-32')}>
        <ul>
          <ListHeaders />
          {promotions?.map((promotion, index) => {
            return (
              <PromotionRow
                key={`slot-${promotion.createdAt.toString()}`}
                index={index}
                promotion={promotion}
                chainId={chainId}
                onClick={() => {
                  setSelectedPromotion(promotion)
                  setIsOpen(true)
                }}
              />
            )
          })}
        </ul>
        {!!selectedPromotion && (
          <EditPromotionModal
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
            promotion={selectedPromotion}
            chainId={chainId}
            currentAccount={currentAccount}
          />
        )}
      </div>
    </>
  )
}

const ListHeaders: React.FC = () => {
  const { t } = useTranslation()

  return (
    <li
      className={classNames(
        'even:bg-pt-teal odd:bg-blue-100',
        'flex items-center',
        'xs:px-2 py-1 border-b border-pt-purple border-opacity-50'
      )}
    >
      <Header className='hidden xs:block xs:w-1/2'>{t('duration', 'Duration')}</Header>
      <Header className='xs:w-1/2'>{t('summary', 'Summary')}</Header>
      <span className='xs:w-4'></span>
    </li>
  )
}

const Header = (props) => (
  <span {...props} className={classNames(props.className, 'uppercase font-bold text-xxxs')} />
)

interface PromotionRowProps {
  chainId: number
  index: number
  promotion?: Promotion
  onClick: () => void
}

/**
 * @param props
 * @returns
 */
const PromotionRow: React.FC<PromotionRowProps> = (props) => {
  const { chainId, index, promotion, onClick } = props

  const { token, tokensPerEpoch, startTimestamp, epochDuration, numberOfEpochs } = promotion

  const { t } = useTranslation()

  return (
    <li
      className={classNames(
        'flex items-center',
        'xs:px-2 py-2 first:border-t border-b border-pt-purple border-opacity-50 text-xxs',
        {
          'bg-actually-black bg-opacity-5 dark:bg-pt-purple-dark': index % 2 === 0
        }
      )}
    >
      <div className='flex items-center w-full'>
        <div className='xs:flex items-center w-full'>
          <PromotionSummary
            isIndex
            className='mt-2 xs:mt-0'
            chainId={chainId}
            token={token}
            tokensPerEpoch={BigNumber.from(tokensPerEpoch)}
            startTimestamp={startTimestamp}
            epochDuration={epochDuration}
            numberOfEpochs={numberOfEpochs}
            promotionId={promotion.id}
          />
        </div>
        <div className='flex justify-end w-4 xs:w-auto'>
          <button onClick={onClick}>
            <FeatherIcon icon={'edit-2'} className='w-4 h-4 text-pt-teal' />
          </button>
        </div>
      </div>
    </li>
  )
}

// /**
//  *
//  * @param props
//  * @returns
//  */
// const TokenDisplay: React.FC<{ className?: string; chainId: number; token: string }> = ({
//   className,
//   chainId,
//   token
// }) => {
//   return (
//     <BlockExplorerLink
//       className={classNames(className, 'flex items-center')}
//       chainId={chainId}
//       address={token}
//       noIcon
//     >
//       <TokenIcon sizeClassName='w-4 h-4' className='mr-2' chainId={chainId} address={token} />
//       <span>{shorten({ hash: token, short: true })}</span>
//     </BlockExplorerLink>
//   )
// }

// /**
//  *
//  * @param props
//  * @returns
//  */
// const TokensPerEpochDisplay: React.FC<{
//   chainId: number
//   account: string
//   token: string
//   tokensPerEpoch: BigNumber
// }> = ({ chainId, account, token, tokensPerEpoch }) => {
//   const queryResult = useTokenBalance(chainId, account, token)
//   if (!queryResult.isFetched || !queryResult.data) {
//     return null
//   }

//   const { decimals } = queryResult.data
//   return (
//     <span className='text-center'>{prettyNumber(BigNumber.from(tokensPerEpoch), decimals)}</span>
//   )
// }

// /**
//  *
//  * @param props
//  * @returns
//  */
// const EpochDurationDisplay: React.FC<{
//   epochDuration: number
// }> = ({ epochDuration }) => {
//   const secondsToDays = (seconds) => seconds / 86400

//   return <span className='text-center'>{numberWithCommas(secondsToDays(epochDuration))}</span>
// }

// /**
//  *
//  * @param props
//  * @returns
//  */
// const NumberOfEpochsDisplay: React.FC<{
//   numberOfEpochs: number
// }> = ({ numberOfEpochs }) => <span className='text-center'>{numberOfEpochs}</span>
