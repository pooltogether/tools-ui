import { SUPPORTED_CHAINS } from '@constants/config'
import { useAppEnvString } from '@hooks/app/useAppEnvString'

export const useSupportedChains = () => {
  const appEnv = useAppEnvString()
  return SUPPORTED_CHAINS[appEnv]
}
