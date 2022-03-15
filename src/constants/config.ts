import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS } from '@twabDelegator/config'
import { getChain } from '@utils/getChain'
import { allChains, Chain } from 'wagmi'
console.log({ allChains })

/////////////////////////////////////////////////////////////////////
// Required constant aggregates from the various tools in the app.
// When adding a new tool (or network) to the app, ensure these constants are updated.
// Ideally from a config.ts inside the respective tool.
/////////////////////////////////////////////////////////////////////

export const SUPPORTED_CHAIN_IDS: {
  [key: string]: number[]
} = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(
    new Set([...TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]])
  ),
  [APP_ENVIRONMENTS.testnets]: Array.from(
    new Set([...TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]])
  )
})

export const SUPPORTED_CHAINS: { [key: string]: Chain[] } = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].map(getChain),
  [APP_ENVIRONMENTS.testnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets].map(getChain)
})

export const ALL_SUPPORTED_CHAINS: Chain[] = [
  ...SUPPORTED_CHAINS[APP_ENVIRONMENTS.mainnets],
  ...SUPPORTED_CHAINS[APP_ENVIRONMENTS.testnets]
]
