// A Typescript implementation of the V5 Liquidator Contract

export function getAmountOut(AI: bigint, VRO: bigint, VRI: bigint) {
  const AO = (AI * VRI) / (AI + VRO)
  if (AO === BigInt(0)) {
    throw new Error('AO is zero')
  }
  return AO
}

export function getExpectedSlippage(AI: bigint, VRO: bigint, VRI: bigint) {
  const K = VRI * VRO
  const AO = getAmountOut(AI, VRO, VRI)
  const expectedSlippage = (AI - AO) / AI
  return expectedSlippage
}

export function getVirtualBuybackAmountOut(AI: bigint, VRO: bigint, VRI: bigint) {
  // Hard cap AO to VRI. This is to prevent the case where AO is so large that
  // virtual reserves get squashed.
  if (AI > VRI) {
    AI = VRI
  }

  const AO = (AI * VRI) / (AI + VRO)
  if (AO === BigInt(0)) {
    throw new Error('AO is zero')
  }
  return AO
}

export function getAmountIn(AO: bigint, VRO: bigint, VRI: bigint) {
  return (AO * VRO) / (VRI - AO) + BigInt(1)
}

export function computeExactAmountIn(VRI: bigint, VRO: bigint, AI0: bigint, AO0: bigint) {
  const { VRI: VRI_1, VRO: VRO_1 } = virtualBuyBack(VRI, VRO, AI0)

  const AI1_1 = getAmountIn(AO0, VRI_1, VRO_1)
  return AI1_1
}

export function computeExactAmountOut(VRI: bigint, VRO: bigint, AI0: bigint, AI1: bigint) {
  const { VRI: VRI_1, VRO: VRO_1 } = virtualBuyBack(VRI, VRO, AI0)
  const AO0 = getAmountOut(AI1, VRI_1, VRO_1)
  return AO0
}

// b = a * k / (x * (x + a))
// AO = (AI * (VRI*VRO)) / (VRO * (VRO + AI))
export function virtualBuyBack(VRI: bigint, VRO: bigint, AI: bigint) {
  const AO = getVirtualBuybackAmountOut(AI, VRO, VRI)
  let VRI_1 = VRI - AO
  let VRO_1 = VRO + AI

  return { VRI: VRI_1, VRO: VRO_1 }
}

function virtualSwap(
  VRI: bigint,
  VRO: bigint,
  Y: bigint,
  AO: bigint,
  SM: bigint,
  LF: bigint,
  MinK: bigint
) {
  // 3.1 Virtual Buyback Amount - SM% of AO is swapped OUT
  const VAO1 = (AO * SM) / BigInt(1e9)

  // 3.2 Virtual Swap
  const VAI0 = getAmountIn(VAO1, VRI, VRO)

  let VRI_1 = VRI + VAI0
  let VRO_1 = VRO - VAO1

  // 3.3 Virtual Swap
  const { VRI: VRI_2, VRO: VRO_2 } = applyLiquidityFraction(VRI_1, VRO_1, Y, LF, MinK)

  return { VRI: VRI_2, VRO: VRO_2 }
}

function applyLiquidityFraction(VRI_1: bigint, VRO_1: bigint, Y: bigint, LF: bigint, MinK: bigint) {
  // 3.3 Virtual Swap - OLD
  // const RF = (Y * BigInt(1e9)) / VRO_1;
  // const M = (RF * BigInt(1e9)) / LF;
  // let VRI_2 = (VRI_1 * M) / BigInt(1e9);
  // let VRO_2 = (VRO_1 * M) / BigInt(1e9);

  // 3.3 Virtual Swap - NEW (March 29)
  let VRI_2 = (VRI_1 * Y * BigInt(1e9)) / (VRO_1 * LF)
  let VRO_2 = (VRO_1 * Y * BigInt(1e9)) / (VRO_1 * LF)

  // Validate new K
  if (VRI_2 * VRO_2 < MinK) {
    console.error('MinK_NEW is too low. Undoing LF Scaling.', {
      MinK: VRI_1 * VRO_1,
      MinK_NEW: VRI_2 * VRO_2
    })
    VRI_2 = VRI_1
    VRO_2 = VRO_1
  }

  return { VRI: VRI_2, VRO: VRO_2 }
}

export function swapExactAmountOut(
  VRI: bigint,
  VRO: bigint,
  Y: bigint,
  AO: bigint,
  SM: bigint,
  LF: bigint,
  MinK: bigint // minimum K
) {
  if (AO === BigInt(0)) {
    throw new Error('AO is zero')
  }

  // 1 Virtual Buyback
  const { VRI: VRI_1, VRO: VRO_1 } = virtualBuyBack(VRI, VRO, Y)
  const { VRI: VRI_TEST, VRO: VRO_TEST } = virtualBuyBack(VRI, VRO, AO)

  console.log({ VRI_1, VRO_1, VRI_TEST, VRO_TEST })

  // 2 Actual Swap
  const AI = getAmountIn(AO, VRI_1, VRO_1)
  let VRI_2 = VRI_1 + AI
  let VRO_2 = VRO_1 - AO

  console.log({ K1: VRI * VRO, K2: VRI_1 * VRO_1, K3: VRI_TEST * VRO_TEST, K4: VRI_2 * VRO_2 })

  // 3. Virtual Swap
  const { VRI: VRI_3, VRO: VRO_3 } = virtualSwap(VRI_2, VRO_2, Y, AO, SM, LF, MinK)

  return { AO, AI, VRI: VRI_3, VRO: VRO_3 }
}

// NOTE: Not used in simulator
export function swapExactAmountIn(
  VRI: bigint,
  VRO: bigint,
  Y: bigint,
  AI: bigint,
  SM: bigint,
  LF: bigint,
  MinK: bigint // minimum K
) {
  // 1 Virtual Buyback
  const { VRI: VRI_1, VRO: VRO_1 } = virtualBuyBack(VRI, VRO, Y)

  // 2 Actual Swap
  const AO = getAmountOut(AI, VRI_1, VRO_1)
  let VRI_2 = VRI_1 + AI
  let VRO_2 = VRO_1 - AO

  // 3. Virtual Swap
  const { VRI: VRI_3, VRO: VRO_3 } = virtualSwap(VRI_2, VRO_2, Y, AO, SM, LF, MinK)
  return { AO, AI, VRI: VRI_3, VRO: VRO_3 }
}
