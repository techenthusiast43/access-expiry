export interface Resource {
  id: string; // bytes32 hex string
  name: string;
  owner: string;
  createdAt: number;
  exists: boolean;
}

export interface Permission {
  recipient: string;
  resourceId: string;
  grantor: string;
  expiryTimestamp: number; // unix timestamp in seconds
  revoked: boolean;
  exists: boolean;
}

export interface PermissionWithStatus extends Permission {
  resourceName?: string;
  isActive: boolean;
  secondsRemaining: number;
  formattedExpiry: string;
  statusLabel: 'Active' | 'Expired' | 'Revoked';
}

export interface HistoryEvent {
  id: string;
  type: 'GRANT' | 'REVOKE' | 'EXTEND' | 'REGISTER';
  resourceId: string;
  resourceName?: string;
  recipient?: string;
  owner?: string;
  timestamp: number;
  expiryTimestamp?: number;
  duration?: number;
  txHash: string;
  blockNumber: number;
}

