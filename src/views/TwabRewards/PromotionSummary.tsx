import { formatUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { numberWithCommas } from '@pooltogether/utilities'
import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'

import { SummaryWell } from './SummaryWell'
import { TokenDisplay } from './TokenDisplay'

interface PromotionSummaryProps {
  chainId: number
  token: string
  tokensPerEpoch: BigNumber
  epochDuration: number
  numberOfEpochs: number
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
  console.log({ tokensPerEpoch })

  return (
    <SummaryWell hidden={hidden || !tokenDataIsFetched || !tokenData?.name} className='w-full'>
      <div className='flex items-center flex-wrap'>
        <strong className='mr-1'>
          {numberOfEpochs ? numberOfEpochs : 'y'} {epochDuration ? epochDuration : 'x'}-{t('day')}
        </strong>{' '}
        {t('epochsWillDistribute', 'epochs will distribute')}:
      </div>
      {Boolean(numberOfEpochs) && Boolean(epochDuration) && Boolean(tokensPerEpoch) && (
        <div className='flex items-center space-x-2 dark:text-white'>
          <span>
            {numberWithCommas(
              formatUnits(tokensPerEpoch.mul(numberOfEpochs), tokenData?.decimals).toString()
            )}
          </span>
          <TokenDisplay chainId={chainId} tokenData={tokenData} />
        </div>
      )}
    </SummaryWell>
  )
}
