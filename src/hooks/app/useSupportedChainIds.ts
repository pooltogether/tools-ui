import { SUPPORTED_CHAIN_IDS } from '@constants/config'
import { getAppEnvString } from '@utils/getAppEnvString'

export const useSupportedChainIds = () => {
  const appEnv = getAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
