export const QUERY_PARAM = Object.freeze({
  liquidator: 'liquidator',
  liquidatorChain: 'liquidator_chain'
})

export const LIQUIDATOR_LEARN_MORE_URL = ''

export enum SlippageSetting {
  low = 'LOW',
  medium = 'MEDIUM',
  custom = 'CUSTOM'
}

export const SlippageAmounts = Object.freeze({
  [SlippageSetting.low]: 0.001,
  [SlippageSetting.medium]: 0.005
})

export enum SwapState {
  ticket = 'V4_TICKET',
  prize = 'PRIZE'
}
