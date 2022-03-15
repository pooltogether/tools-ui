import { NetworkIcon } from '@pooltogether/react-components'
import React, { useState } from 'react'

import classNames from 'classnames'
import { useConnect } from 'wagmi'
import { useWalletChainId } from '@hooks/wallet/useWalletChainId'
import { NetworkSelectionModal } from './NetworkSelectionModal'

interface NetworkSelectionButtonProps {
  className?: string
}

export const NetworkSelectionButton: React.FC<NetworkSelectionButtonProps> = (props) => {
  const [{ data, error, loading }, connect] = useConnect()
  const chainId = useWalletChainId()
  const [isOpen, setIsOpen] = useState(false)

  if (!data.connected || !data.connector) return null

  return (
    <>
      <button className={classNames(props.className, 'flex')} onClick={() => setIsOpen(true)}>
        <NetworkIcon chainId={chainId} />
      </button>
      <NetworkSelectionModal
        closeModal={() => setIsOpen(false)}
        isOpen={isOpen}
        connector={data.connector}
      />
    </>
  )
}
