import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import {
  useCoingeckoTokenPrices,
  useTokenFaucetData,
  useUsersTokenFaucetRewards,
  useUsersV3PrizePoolBalance,
  useV3PrizePools,
  V3PrizePool
} from '@pooltogether/hooks'
import { SquareButtonSize, ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import {
  TransactionStatus,
  useSendTransaction,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useSigner } from 'wagmi'
import TokenFaucetAbi from './abis/TokenFaucet'
import { tokenFaucetChainIdAtom } from './atoms'
import { TOKEN_FAUCET_ADDRESSES } from './config'

export const TokenFaucetList = () => {
  const [chainId] = useAtom(tokenFaucetChainIdAtom)
  const tokenFaucetAddresses = TOKEN_FAUCET_ADDRESSES[chainId]
  const { data: prizePools, isFetched } = useV3PrizePools()

  return (
    <ul className='grid grid-cols-1 gap-4'>
      {!isFetched && <li>Loading...</li>}
      {isFetched &&
        prizePools[chainId].flatMap((prizePool) => {
          // LP token faucet. Accessible through app.pooltogether.com.
          // TODO: Fetching token price data for an LP token is awkward right now. Revisit when we have a better solution.
          if (prizePool.addresses.prizePool === '0x3af7072d29adde20fc7e173a7cb9e45307d2fb0a')
            return []
          return prizePool.addresses.tokenFaucets?.map((tokenFaucetAddress) => (
            <TokenFaucetItem
              prizePool={prizePool}
              tokenFaucetAddress={tokenFaucetAddress}
              key={tokenFaucetAddress}
            />
          ))
        })}
    </ul>
  )
}

const TokenFaucetItem: React.FC<{ prizePool: V3PrizePool; tokenFaucetAddress: string }> = (
  props
) => {
  const { prizePool, tokenFaucetAddress } = props
  const [chainId] = useAtom(tokenFaucetChainIdAtom)
  const usersAddress = useUsersAddress()
  const {
    data: balanceData,
    isFetched: isBalanceDataFetched,
    refetch: refetchBalanceData
  } = useUsersV3PrizePoolBalance(
    usersAddress || ethers.constants.AddressZero,
    chainId,
    prizePool.addresses.prizePool,
    prizePool.addresses.ticket
  )
  const {
    data: tokenFaucetData,
    isFetched: isTokenFaucetDataFetched,
    refetch: refetchTokenFaucetData
  } = useTokenFaucetData(chainId, tokenFaucetAddress, prizePool, balanceData?.token)
  const {
    data: usersTokenFaucetRewards,
    isFetched: isUsersTokenFaucetRewardsFetched,
    refetch: refetchTokenFaucetRewardsData
  } = useUsersTokenFaucetRewards(
    chainId,
    usersAddress,
    prizePool,
    tokenFaucetAddress,
    balanceData?.token
  )
  const { data: signer } = useSigner()
  const [transactionId, setTransactionId] = useState<string>()
  const transaction = useTransaction(transactionId)
  const sendTransaction = useSendTransaction()

  const submitTransaction = async () => {
    const callTransaction = () => {
      const faucetContract = new ethers.Contract(tokenFaucetAddress, TokenFaucetAbi, signer)
      return faucetContract.functions.claim(usersAddress)
    }

    const transactionId = sendTransaction({
      name: `Claim ${tokenFaucetData?.dripToken.symbol}`,
      callTransaction,
      callbacks: {
        refetch: () => {
          refetchBalanceData()
          refetchTokenFaucetData()
          refetchTokenFaucetRewardsData()
        }
      }
    })
    setTransactionId(transactionId)
  }

  const showReceiptButton = transaction?.status === TransactionStatus.success
  const hasClaimable = usersTokenFaucetRewards?.hasBalance

  return (
    <li className='p-4 bg-actually-black bg-opacity-10 rounded-xl'>
      {!isBalanceDataFetched || !isTokenFaucetDataFetched ? (
        'Loading...'
      ) : (
        <div className='grid grid-cols-3 gap-y-4 gap-x-1'>
          <div className='flex flex-col'>
            <span className='text-xxs text-pt-purple-darkest text-opacity-75 dark:text-pt-purple-lightest dark:text-opacity-75'>
              Deposit token
            </span>
            <div className='flex items-center space-x-2'>
              <TokenIcon chainId={chainId} address={tokenFaucetData.measureToken.address} />
              <span className='text-xxs xs:text-xs'>{tokenFaucetData.measureToken.symbol}</span>
            </div>
          </div>
          <div className='flex flex-col'>
            <span className='text-xxs text-pt-purple-darkest text-opacity-75 dark:text-pt-purple-lightest dark:text-opacity-75'>
              Drip token
            </span>
            <div className='flex items-center space-x-2'>
              <TokenIcon chainId={chainId} address={tokenFaucetData.dripToken.address} />
              <span className='text-xxs xs:text-xs'>{tokenFaucetData.dripToken.symbol}</span>
            </div>
          </div>
          <div className='flex flex-col'>
            <span className='text-xxs text-pt-purple-darkest text-opacity-75 dark:text-pt-purple-lightest dark:text-opacity-75'>
              Claimable
            </span>
            {!isUsersTokenFaucetRewardsFetched ? (
              <ThemedClipSpinner sizeClassName='w-4 h-4' />
            ) : hasClaimable ? (
              <div className='flex flex-row space-x-2 items-center'>
                <span>{usersTokenFaucetRewards.amountPretty}</span>
                <TokenIcon chainId={chainId} address={tokenFaucetData.dripToken.address} />
              </div>
            ) : (
              <span className='opacity-50'>0</span>
            )}
          </div>
          {!!usersAddress && hasClaimable && (
            <>
              <TxButton
                type='button'
                size={SquareButtonSize.sm}
                chainId={chainId}
                state={transaction?.state}
                status={transaction?.status}
                className={classNames('w-full col-span-3 capitalize', {
                  'mb-2': showReceiptButton
                })}
                onClick={() => submitTransaction()}
              >
                Claim
              </TxButton>
              {showReceiptButton && (
                <TransactionReceiptButton
                  size={SquareButtonSize.sm}
                  chainId={chainId}
                  transaction={transaction}
                />
              )}
            </>
          )}
        </div>
      )}
    </li>
  )
}
