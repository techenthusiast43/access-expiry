export const ACCESS_EXPIRY_ABI = [
  {
    "type": "error",
    "name": "EmptyResourceName",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidDuration",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidRecipientAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotResourceOwner",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "caller", "type": "address" }
    ]
  },
  {
    "type": "error",
    "name": "PermissionAlreadyRevoked",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" }
    ]
  },
  {
    "type": "error",
    "name": "PermissionNotFound",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ResourceAlreadyExists",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" }
    ]
  },
  {
    "type": "error",
    "name": "ResourceNotFound",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" }
    ]
  },
  {
    "type": "event",
    "name": "AccessExtended",
    "inputs": [
      { "name": "resourceId", "type": "bytes32", "indexed": true },
      { "name": "recipient", "type": "address", "indexed": true },
      { "name": "oldExpiryTimestamp", "type": "uint256", "indexed": false },
      { "name": "newExpiryTimestamp", "type": "uint256", "indexed": false },
      { "name": "grantor", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AccessGranted",
    "inputs": [
      { "name": "resourceId", "type": "bytes32", "indexed": true },
      { "name": "recipient", "type": "address", "indexed": true },
      { "name": "grantor", "type": "address", "indexed": true },
      { "name": "expiryTimestamp", "type": "uint256", "indexed": false },
      { "name": "duration", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AccessRevoked",
    "inputs": [
      { "name": "resourceId", "type": "bytes32", "indexed": true },
      { "name": "recipient", "type": "address", "indexed": true },
      { "name": "revoker", "type": "address", "indexed": true },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResourceRegistered",
    "inputs": [
      { "name": "resourceId", "type": "bytes32", "indexed": true },
      { "name": "name", "type": "string", "indexed": false },
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "name": "extendAccess",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" },
      { "name": "additionalDuration", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAllResources",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "id", "type": "bytes32" },
          { "name": "name", "type": "string" },
          { "name": "owner", "type": "address" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "exists", "type": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPermission",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" }
    ],
    "outputs": [
      {
        "name": "perm",
        "type": "tuple",
        "components": [
          { "name": "recipient", "type": "address" },
          { "name": "resourceId", "type": "bytes32" },
          { "name": "grantor", "type": "address" },
          { "name": "expiryTimestamp", "type": "uint256" },
          { "name": "revoked", "type": "bool" },
          { "name": "exists", "type": "bool" }
        ]
      },
      { "name": "isActive", "type": "bool" },
      { "name": "secondsRemaining", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPermissionsByRecipient",
    "inputs": [{ "name": "recipient", "type": "address" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "recipient", "type": "address" },
          { "name": "resourceId", "type": "bytes32" },
          { "name": "grantor", "type": "address" },
          { "name": "expiryTimestamp", "type": "uint256" },
          { "name": "revoked", "type": "bool" },
          { "name": "exists", "type": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPermissionsByResource",
    "inputs": [{ "name": "resourceId", "type": "bytes32" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "recipient", "type": "address" },
          { "name": "resourceId", "type": "bytes32" },
          { "name": "grantor", "type": "address" },
          { "name": "expiryTimestamp", "type": "uint256" },
          { "name": "revoked", "type": "bool" },
          { "name": "exists", "type": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getResourcesByOwner",
    "inputs": [{ "name": "owner", "type": "address" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "id", "type": "bytes32" },
          { "name": "name", "type": "string" },
          { "name": "owner", "type": "address" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "exists", "type": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalResourcesCount",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "grantAccess",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" },
      { "name": "duration", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasAccess",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "permissions",
    "inputs": [
      { "name": "", "type": "bytes32" },
      { "name": "", "type": "address" }
    ],
    "outputs": [
      { "name": "recipient", "type": "address" },
      { "name": "resourceId", "type": "bytes32" },
      { "name": "grantor", "type": "address" },
      { "name": "expiryTimestamp", "type": "uint256" },
      { "name": "revoked", "type": "bool" },
      { "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerResource",
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "customId", "type": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resources",
    "inputs": [{ "name": "", "type": "bytes32" }],
    "outputs": [
      { "name": "id", "type": "bytes32" },
      { "name": "name", "type": "string" },
      { "name": "owner", "type": "address" },
      { "name": "createdAt", "type": "uint256" },
      { "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "revokeAccess",
    "inputs": [
      { "name": "resourceId", "type": "bytes32" },
      { "name": "recipient", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;

