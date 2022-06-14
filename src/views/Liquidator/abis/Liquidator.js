export default [
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IPrizePoolLiquidatorListener',
        name: 'listener',
        type: 'address'
      }
    ],
    name: 'ListenerSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousManager', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newManager', type: 'address' }
    ],
    name: 'ManagerTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'pendingOwner', type: 'address' }],
    name: 'OwnershipOffered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'contract IPrizePool', name: 'prizePool', type: 'address' },
      { indexed: false, internalType: 'contract IERC20', name: 'want', type: 'address' },
      { indexed: false, internalType: 'address', name: 'target', type: 'address' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountOut', type: 'uint256' }
    ],
    name: 'Swapped',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' }],
    name: 'availableBalanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'claimOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' },
      { internalType: 'uint256', name: '_amountOut', type: 'uint256' }
    ],
    name: 'computeExactAmountIn',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' }
    ],
    name: 'computeExactAmountOut',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' }],
    name: 'getLiquidationConfig',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'contract IERC20', name: 'want', type: 'address' },
          { internalType: 'uint32', name: 'swapMultiplier', type: 'uint32' },
          { internalType: 'uint32', name: 'liquidityFraction', type: 'uint32' }
        ],
        internalType: 'struct PrizePoolLiquidator.LiquidatorConfig',
        name: 'state',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' }],
    name: 'getLiquidationState',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
          { internalType: 'uint256', name: 'reserveB', type: 'uint256' }
        ],
        internalType: 'struct PrizePoolLiquidator.LiquidatorState',
        name: 'state',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getListener',
    outputs: [{ internalType: 'contract IPrizePoolLiquidatorListener', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'manager',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' }],
    name: 'nextLiquidationState',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
          { internalType: 'uint256', name: 'reserveB', type: 'uint256' }
        ],
        internalType: 'struct PrizePoolLiquidator.LiquidatorState',
        name: 'state',
        type: 'tuple'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePoolLiquidatorListener', name: '_listener', type: 'address' }
    ],
    name: 'setListener',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_newManager', type: 'address' }],
    name: 'setManager',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_pool', type: 'address' },
      { internalType: 'address', name: '_target', type: 'address' },
      { internalType: 'contract IERC20', name: '_want', type: 'address' },
      { internalType: 'uint32', name: '_swapMultiplier', type: 'uint32' },
      { internalType: 'uint32', name: '_liquidityFraction', type: 'uint32' },
      { internalType: 'uint192', name: '_reserveA', type: 'uint192' },
      { internalType: 'uint192', name: '_reserveB', type: 'uint192' }
    ],
    name: 'setPrizePool',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint256', name: '_amountOutMin', type: 'uint256' }
    ],
    name: 'swapExactAmountIn',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' },
      { internalType: 'uint256', name: '_amountOut', type: 'uint256' },
      { internalType: 'uint256', name: '_amountInMax', type: 'uint256' }
    ],
    name: 'swapExactAmountOut',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
