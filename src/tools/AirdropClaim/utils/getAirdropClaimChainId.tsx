import { getAppEnvString } from '@utils/getAppEnvString'
import { AIRDROP_CLAIM_CHAIN_ID } from '../config'

export const getAirdropClaimChainId = () => {
  const appEnv = getAppEnvString()
  return AIRDROP_CLAIM_CHAIN_ID[appEnv]
}
