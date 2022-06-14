import { BottomSheet } from '@pooltogether/react-components'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import { slippagePercentAtom, slippageSettingAtom } from '../atoms'
import { SlippageAmounts, SlippageSetting } from '../constants'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

export const Options: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={classNames(className, 'flex justify-between')}>
        <span className='font-bold'>{t('swap', 'Swap')}</span>
        <button
          className='transition hover:opacity-70 flex space-x-2 items-center'
          onClick={() => setIsOpen(true)}
        >
          <span className='text-xxs'>Transaction Settings</span>
          <FeatherIcon icon='settings' className='w-4 h-4' />
        </button>
      </div>
      <BottomSheet
        label={'swap-settings'}
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
        maxWidthClassName='max-w-md'
      >
        <p>Settings</p>
        <SlippageToggles />
      </BottomSheet>
    </>
  )
}

const SlippageToggles = () => {
  return (
    <div>
      <p className='text-xs'>Slippage tolerance</p>
      <div className='space-x-2'>
        <SlippageButton slippageSetting={SlippageSetting.low} />
        <SlippageButton slippageSetting={SlippageSetting.medium} />
        <SlippageButton slippageSetting={SlippageSetting.custom} />
      </div>
      <CustomSlippageInput />
    </div>
  )
}

const SlippageButton: React.FC<{ slippageSetting: SlippageSetting }> = (props) => {
  const { slippageSetting } = props
  const { t } = useTranslation()
  const updateSlippagePercent = useUpdateAtom(slippagePercentAtom)
  const [currentSlippageSetting, updateSlippageSetting] = useAtom(slippageSettingAtom)

  const selected = slippageSetting === currentSlippageSetting

  return (
    <button
      className={classNames(
        'py-1 px-2 bg-actually-black rounded transition border  hover:border-pt-purple-lighter hover:bg-opacity-50',
        {
          'border-transparent bg-opacity-20 ': !selected,
          'border border-pt-purple-light bg-opacity-40': selected
        }
      )}
      {...props}
      onClick={() => {
        updateSlippageSetting(slippageSetting)
        if (slippageSetting !== SlippageSetting.custom) {
          updateSlippagePercent(SlippageAmounts[slippageSetting])
        }
      }}
    >
      {slippageSetting === SlippageSetting.custom
        ? t('custom', 'Custom')
        : SlippageAmounts[slippageSetting]}
    </button>
  )
}

const CustomSlippageInput = () => {
  const [currentSlippageSetting] = useAtom(slippageSettingAtom)
  const updateSlippagePercent = useUpdateAtom(slippagePercentAtom)

  return <>{currentSlippageSetting === SlippageSetting.custom && <div>Input go here</div>}</>
}
