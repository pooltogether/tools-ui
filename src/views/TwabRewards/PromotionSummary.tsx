import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { numberWithCommas } from '@pooltogether/utilities'
import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { BlockExplorerLink } from '@pooltogether/react-components'

import { SummaryWell } from './SummaryWell'
import { TokenDisplay } from './TokenDisplay'

interface PromotionSummaryProps {
  chainId: number
  token: string
  tokensPerEpoch: BigNumber
  epochDuration: number
  numberOfEpochs: number
  className?: string
  hideBackground?: boolean
  hidden?: boolean
}

export const PromotionSummary = (props: PromotionSummaryProps) => {
  const { chainId, hidden, numberOfEpochs, epochDuration, tokensPerEpoch, token } = props

  const { t } = useTranslation()
  const usersAddress = useUsersAddress()

  const { data: tokenData, isFetched: tokenDataIsFetched } = useTokenBalance(
    chainId,
    usersAddress,
    token
  )

  return (
    <SummaryWell {...props} hidden={hidden || !tokenDataIsFetched || !tokenData?.name}>
      <div className='flex items-center flex-wrap opacity-60'>
        <span className='mr-1'>
          {numberOfEpochs ? numberOfEpochs : 'y'}{' '}
          {epochDuration ? numberWithCommas(epochDuration) : 'x'}
          <span className='lowercase'> {t('day')}</span>
        </span>{' '}
        {t('epochsWillDistribute', 'epochs will distribute')}:
      </div>
      {Boolean(numberOfEpochs) && Boolean(epochDuration) && Boolean(tokensPerEpoch) && (
        <div className='flex items-center space-x-2 dark:text-white'>
          <span>
            {numberWithCommas(
              formatUnits(tokensPerEpoch.mul(numberOfEpochs), tokenData?.decimals).toString()
            )}
          </span>
          <BlockExplorerLink className='flex items-center' chainId={chainId} address={token} noIcon>
            <TokenDisplay chainId={chainId} tokenData={tokenData} />
          </BlockExplorerLink>
        </div>
      )}
    </SummaryWell>
  )
}
