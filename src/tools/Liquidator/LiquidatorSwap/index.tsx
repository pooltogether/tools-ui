import { LiquidatorFormValues } from '@liquidator/interfaces'
import { ApproveSwapButton } from '@liquidator/LiquidatorSwap/ApproveSwapButton'
import { Options } from '@liquidator/LiquidatorSwap/Options'
import { SendSwapButton } from '@liquidator/LiquidatorSwap/SendSwapButton'
import { SwapAmounts } from '@liquidator/LiquidatorSwap/SwapAmounts'
import { SwapBackground } from '@liquidator/LiquidatorSwap/SwapBackground'
import { SwapInfo } from '@liquidator/LiquidatorSwap/SwapInfo'
import { FormProvider, useForm } from 'react-hook-form'

export const LiquidatorSwap = () => {
  const methods = useForm<LiquidatorFormValues>({
    mode: 'onChange',
    defaultValues: { amountIn: '' },
    shouldUnregister: true
  })

  return (
    <SwapBackground>
      <FormProvider {...methods}>
        <Options className='mb-2' />
        <SwapAmounts className='mb-2' />
        <SwapInfo className='mb-4' />
        <ApproveSwapButton className='mb-2' />
        <SendSwapButton className='mb-2' />
      </FormProvider>
    </SwapBackground>
  )
}
