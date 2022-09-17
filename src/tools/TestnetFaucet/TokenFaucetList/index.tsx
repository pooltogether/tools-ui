import { TransactionReceiptButton } from '@components/Buttons/TransactionReceiptButton'
import { TxButton } from '@components/Buttons/TxButton'
import { TokenWithAllBalances, useTokenBalances } from '@pooltogether/hooks'
import { SquareButtonSize, TokenIcon } from '@pooltogether/react-components'
import {
  BlockExplorerLink,
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
import faucetAbi from '../abis/faucet'
import { testnetFaucetChainIdAtom } from '../atoms'
import { FAUCET_ADDRESS, TOKEN_ADDRESSES } from '../config'

export const TokenFaucetList = () => {
  const [chainId] = useAtom(testnetFaucetChainIdAtom)
  const tokenAddressList = TOKEN_ADDRESSES[chainId]
  const faucetAddress = FAUCET_ADDRESS[chainId]
  const {
    data: tokenBalances,
    isFetched,
    refetch
  } = useTokenBalances(chainId, faucetAddress, tokenAddressList)

  if (!isFetched) return <div>Loading</div>

  return (
    <ul className='space-y-3'>
      {tokenAddressList.map((tokenAddress) => (
        <TokenFaucet
          key={tokenAddress}
          {...tokenBalances[tokenAddress]}
          chainId={chainId}
          refetch={refetch}
          faucetAddress={faucetAddress}
        />
      ))}
    </ul>
  )
}

export const TokenFaucet: React.FC<
  TokenWithAllBalances & { chainId: number; refetch: () => void; faucetAddress: string }
> = (props) => {
  const {
    address: tokenAddress,
    name,
    symbol,
    amountPretty,
    refetch,
    chainId,
    faucetAddress
  } = props
  const { data: signer } = useSigner()
  const [transactionId, setTransactionId] = useState<string>()
  const transaction = useTransaction(transactionId)
  const sendTransaction = useSendTransaction()
  const usersAddress = useUsersAddress()

  const submitTransaction = async () => {
    const callTransaction = () => {
      const faucetContract = new ethers.Contract(faucetAddress, faucetAbi, signer)
      return faucetContract.functions.drip(tokenAddress)
    }

    const transactionId = sendTransaction({
      name: `Drip ${symbol}`,
      callTransaction,
      callbacks: {
        refetch: () => {
          refetch()
        }
      }
    })
    setTransactionId(transactionId)
  }

  const showReceiptButton = transaction?.status === TransactionStatus.success

  return (
    <li className='bg-pt-purple-light dark:bg-pt-purple-dark rounded-lg px-4 py-2'>
      <div className='flex flex-col xs:flex-row xs:justify-between'>
        <div className='font-bold xs:text-lg'>{name}</div>
        <div className='flex space-x-1 items-center'>
          <div className='text-xxs xs:text-xs'>{symbol}</div>
          <TokenIcon chainId={chainId} address={tokenAddress} sizeClassName='w-4 h-4' />
        </div>
      </div>
      <div className={classNames('flex justify-between', { 'mb-4': !!usersAddress })}>
        <BlockExplorerLink chainId={chainId} address={tokenAddress} shorten />
        <div className='flex space-x-1'>
          <div>Available:</div>
          <div className='font-bold'>{amountPretty}</div>
        </div>
      </div>
      {!!usersAddress && (
        <>
          <TxButton
            type='button'
            size={SquareButtonSize.sm}
            chainId={chainId}
            state={transaction?.state}
            status={transaction?.status}
            className={classNames('w-full capitalize', { 'mb-2': showReceiptButton })}
            onClick={() => submitTransaction()}
          >
            {'Drip'}
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
    </li>
  )
}
