import { SUPPORTED_CHAINS } from '@constants/config'
import { getAppEnvString } from '@utils/getAppEnvString'

export const useSupportedChains = () => {
  const appEnv = getAppEnvString()
  return SUPPORTED_CHAINS[appEnv]
}
