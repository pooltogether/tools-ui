import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'
import { SelectNetworkModal } from './SelectNetworkModal'

export const ToolNetworkSelectionTrigger: React.FC<{
  currentChainId: number
  supportedChainIds: number[]
  description: string
  label: string
  setChainId: (chainId: number) => void
}> = (props) => {
  const { currentChainId, supportedChainIds, description, label, setChainId } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='flex items-center transition hover:opacity-80'
      >
        <NetworkIcon chainId={currentChainId} className='mr-2' sizeClassName='w-4 h-4' />
        <div className='flex items-center space-x-2'>
          <span className='capitalize leading-none tracking-wider text-xs'>
            {getNetworkNiceNameByChainId(currentChainId)}
          </span>
          <span className='text-pt-teal text-xxxs'>
            <FeatherIcon icon='settings' className='w-3 h-3' />
          </span>
        </div>
      </button>
      <SelectNetworkModal
        label={label}
        isOpen={isOpen}
        description={description}
        selectedChainId={currentChainId}
        chainIds={supportedChainIds}
        setSelectedChainId={setChainId}
        setIsOpen={setIsOpen}
      />
    </>
  )
}
