import { SUPPORTED_CHAIN_IDS } from '@constants/config'
import { useAppEnvString } from '@hooks/app/useAppEnvString'

export const useSupportedChainIds = () => {
  const appEnv = useAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
