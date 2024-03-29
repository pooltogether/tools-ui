export default [
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
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
      { indexed: true, internalType: 'uint32', name: 'drawId', type: 'uint32' },
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        indexed: false,
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: 'prizeTier',
        type: 'tuple'
      }
    ],
    name: 'PrizeTierPushed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint32', name: 'drawId', type: 'uint32' },
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        indexed: false,
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: 'prizeTier',
        type: 'tuple'
      }
    ],
    name: 'PrizeTierSet',
    type: 'event'
  },
  {
    inputs: [],
    name: 'claimOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'count',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getNewestDrawId',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getOldestDrawId',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint32', name: 'drawId', type: 'uint32' }],
    name: 'getPrizeTier',
    outputs: [
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'getPrizeTierAtIndex',
    outputs: [
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint32[]', name: '_drawIds', type: 'uint32[]' }],
    name: 'getPrizeTierList',
    outputs: [
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2[]',
        name: '',
        type: 'tuple[]'
      }
    ],
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
    inputs: [
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: 'newPrizeTier',
        type: 'tuple'
      }
    ],
    name: 'popAndPush',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: 'nextPrizeTier',
        type: 'tuple'
      }
    ],
    name: 'push',
    outputs: [],
    stateMutability: 'nonpayable',
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
      {
        components: [
          { internalType: 'uint8', name: 'bitRangeSize', type: 'uint8' },
          { internalType: 'uint32', name: 'drawId', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPicksPerUser', type: 'uint32' },
          { internalType: 'uint32', name: 'expiryDuration', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestampOffset', type: 'uint32' },
          { internalType: 'uint32', name: 'dpr', type: 'uint32' },
          { internalType: 'uint256', name: 'prize', type: 'uint256' },
          { internalType: 'uint32[16]', name: 'tiers', type: 'uint32[16]' }
        ],
        internalType: 'struct IPrizeTierHistoryV2.PrizeTierV2',
        name: 'newPrizeTier',
        type: 'tuple'
      }
    ],
    name: 'replace',
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
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
