import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { sToD, sToMs, numberWithCommas } from '@pooltogether/utilities'
import { useToken } from '@pooltogether/hooks'
import { format } from 'date-fns'
import { SummaryWell } from './SummaryWell'
import { TokenDisplay } from './TokenDisplay'
import { BlockExplorerLink } from '@pooltogether/wallet-connection'

interface PromotionSummaryProps {
  chainId: number
  token: string
  startTimestamp: number
  tokensPerEpoch: BigNumber
  epochDuration: number
  numberOfEpochs: number
  promotionId?: string
  className?: string
  isIndex?: boolean
  hidden?: boolean
}

export const PromotionSummary = (props: PromotionSummaryProps) => {
  const {
    chainId,
    token,
    promotionId,
    tokensPerEpoch,
    startTimestamp,
    epochDuration,
    numberOfEpochs,
    isIndex,
    hidden
  } = props

  const { t } = useTranslation()

  const {
    data: tokenData,
    isFetched: tokenDataIsFetched,
    isError: tokenDataIsError
  } = useToken(chainId, token)
  if (tokenDataIsError) {
    console.error(tokenDataIsError)
  }

  if (
    !Boolean(numberOfEpochs) ||
    !Boolean(epochDuration) ||
    !Boolean(tokensPerEpoch) ||
    !tokenDataIsFetched ||
    !tokenData?.name
  ) {
    return null
  }

  const StartsAndEndsDisplay = (
    <>
      <StartTimestampDisplay startTimestamp={startTimestamp} />
      <EndTimestampDisplay
        startTimestamp={startTimestamp}
        numberOfEpochs={numberOfEpochs}
        epochDuration={epochDuration}
      />
    </>
  )

  const SummaryDisplay = (
    <SummaryWell
      {...props}
      hideBackground={isIndex}
      hidden={hidden || !tokenDataIsFetched || !tokenData?.name}
    >
      {!isIndex && <div className='mb-2'>{StartsAndEndsDisplay}</div>}

      <div className='flex items-center flex-wrap opacity-60'>
        <span className='mr-1'>
          {numberOfEpochs ? numberOfEpochs : 'y'}x{' '}
          {epochDuration ? numberWithCommas(sToD(epochDuration)) : 'x'}
          <span className='lowercase'>-{t('day')}</span>
        </span>{' '}
        {t('epochsWillDistribute', 'epochs will distribute')}:
      </div>
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
    </SummaryWell>
  )

  if (isIndex) {
    return (
      <>
        <span className='xs:w-1/12 hidden xs:block'>{parseInt(promotionId, 16)}</span>
        <span className='xs:w-5/12'>{StartsAndEndsDisplay}</span>
        <span className='xs:w-1/2'>{SummaryDisplay}</span>
      </>
    )
  } else {
    return SummaryDisplay
  }
}

/**
 *
 * @param props
 * @returns
 */
const StartTimestampDisplay: React.FC<{
  startTimestamp: number
}> = ({ startTimestamp }) => {
  const { t } = useTranslation()
  return (
    <span>
      <span className='opacity-60 uppercase'>{t('starts')}</span>:{' '}
      {format(new Date(sToMs(startTimestamp)), 'MMM do yyyy')},{' '}
      {format(new Date(sToMs(startTimestamp)), 'p')}
    </span>
  )
}

/**
 *
 * @param props
 * @returns
 */
const EndTimestampDisplay: React.FC<{
  startTimestamp: number
  numberOfEpochs: number
  epochDuration: number
}> = ({ startTimestamp, numberOfEpochs, epochDuration }) => {
  const { t } = useTranslation()

  const duration = Number(numberOfEpochs) * Number(epochDuration)
  const endTimestamp = Number(startTimestamp) + duration

  return (
    <div>
      <span className='opacity-60 uppercase'>{t('ends')}</span>:{' '}
      {format(new Date(sToMs(endTimestamp)), 'MMM do yyyy')},{' '}
      {format(new Date(sToMs(endTimestamp)), 'p')}
    </div>
  )
}
