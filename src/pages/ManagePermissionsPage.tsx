import React, { useState, useEffect } from 'react';
import {
  Users2,
  Clock,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  XCircle,
  CheckCircle2,
  CalendarPlus,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { Resource, PermissionWithStatus } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';
import { StatusBadge } from '../components/StatusBadge';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface ManagePermissionsPageProps {
  initialResourceId?: string;
  onNavigate: (tab: string, resourceId?: string) => void;
}

export const ManagePermissionsPage: React.FC<ManagePermissionsPageProps> = ({
  initialResourceId,
  onNavigate,
}) => {
  const {
    account,
    loadOwnedResources,
    loadPermissionsForResource,
    revokeAccess,
    extendAccess,
    connectWallet,
    isCorrectNetwork,
    switchToBotChain,
  } = useWeb3();

  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(initialResourceId || '');
  const [permissions, setPermissions] = useState<PermissionWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Extend Modal State
  const [extendingRecipient, setExtendingRecipient] = useState<string | null>(null);
  const [extensionDuration, setExtensionDuration] = useState<number>(86400); // 24 hours
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Load owned resources
  useEffect(() => {
    const fetchResources = async () => {
      if (account) {
        const list = await loadOwnedResources();
        setResources(list);
        if (!selectedResourceId && list.length > 0) {
          setSelectedResourceId(list[0].id);
        }
      } else {
        setResources([]);
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [account]);

  // Load permissions whenever selected resource changes
  const fetchPermissions = async () => {
    if (!selectedResourceId) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await loadPermissionsForResource(selectedResourceId);
      setPermissions(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [selectedResourceId]);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleRevoke = async (recipient: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${recipient}?`)) {
      return;
    }
    if (!isCorrectNetwork) {
      await switchToBotChain();
      return;
    }

    try {
      setIsProcessingAction(true);
      const res = await revokeAccess(selectedResourceId, recipient);
      if (res.success) {
        await fetchPermissions();
      }
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!extendingRecipient) return;
    if (!isCorrectNetwork) {
      await switchToBotChain();
      return;
    }

    try {
      setIsProcessingAction(true);
      const res = await extendAccess(selectedResourceId, extendingRecipient, extensionDuration);
      if (res.success) {
        setExtendingRecipient(null);
        await fetchPermissions();
      }
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filtered and searched list
  const filteredPermissions = permissions.filter((perm) => {
    if (filter === 'ACTIVE' && !perm.isActive) return false;
    if (filter === 'EXPIRED' && (perm.isActive || perm.revoked)) return false;
    if (filter === 'REVOKED' && !perm.revoked) return false;
    if (
      searchTerm &&
      !perm.recipient.toLowerCase().includes(searchTerm.toLowerCase().trim())
    ) {
      return false;
    }
    return true;
  });

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Users2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Manage Permissions</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Connect your wallet to inspect granted permissions, monitor dynamic expiry countdowns, and execute manual revocations or extensions.
          </p>
        </div>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-950"
        >
          Connect Wallet to Manage
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Users2 className="w-7 h-7 text-cyan-400" />
            Manage Resource Permissions
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Real-time permission roster, live expiration countdowns, and instant revocation or extension controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPermissions}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-cyan-400 transition"
            title="Refresh Permissions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('grant', selectedResourceId)}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-cyan-950 transition"
          >
            <PlusCircle className="w-4 h-4" /> Grant New Permission
          </button>
        </div>
      </div>

      {/* Resource Selector & Filter Bar */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Resource Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Select Owned Resource
            </label>
            {resources.length > 0 ? (
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id.slice(0, 8)}...{r.id.slice(-6)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-gray-400 py-2">
                No owned resources found.{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-cyan-400 underline"
                >
                  Register one here
                </button>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Filter by Recipient Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search 0x..."
                className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Status Tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Status Filter
            </label>
            <div className="flex rounded-xl bg-gray-950 p-1 border border-gray-800 text-xs">
              {(['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                    filter === tab
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Permissions List / Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Showing {filteredPermissions.length} of {permissions.length} total permissions
          </span>
          <span className="font-mono">Network: BOT Chain Testnet</span>
        </div>

        {isLoading ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            <span className="text-xs">Fetching permission records from BOT Chain...</span>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center text-gray-400 mx-auto">
              <Users2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-semibold text-white">No Permissions Found</h3>
              <p className="text-xs text-gray-400">
                {searchTerm || filter !== 'ALL'
                  ? 'No permissions match your search or filter criteria.'
                  : 'No access permissions have been granted for this resource yet.'}
              </p>
            </div>
            {permissions.length === 0 && selectedResourceId && (
              <button
                onClick={() => onNavigate('grant', selectedResourceId)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Grant First Permission
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredPermissions.map((perm) => (
              <div
                key={perm.recipient}
                className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 sm:p-5 transition shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Recipient & Status */}
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={perm.statusLabel} />
                    <span className="text-xs font-mono font-medium text-gray-300 break-all">
                      {perm.recipient}
                    </span>
                    <button
                      onClick={() => copyAddress(perm.recipient)}
                      className="text-gray-400 hover:text-cyan-400 p-1"
                      title="Copy Address"
                    >
                      {copiedAddress === perm.recipient ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`${BOT_CHAIN_INFO.blockExplorerUrl}/address/${perm.recipient}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-cyan-400 p-1"
                      title="View on BOT Scan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-3">
                    <span>
                      Expires: <strong className="text-gray-300">{perm.formattedExpiry}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Grantor: <span className="font-mono text-gray-500">{perm.grantor.slice(0, 6)}...</span>
                    </span>
                  </div>
                </div>

                {/* Center: Live Dynamic Countdown */}
                <div className="shrink-0">
                  <CountdownTimer
                    expiryTimestamp={perm.expiryTimestamp}
                    isRevoked={perm.revoked}
                  />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setExtendingRecipient(perm.recipient);
                      setExtensionDuration(86400);
                    }}
                    disabled={isProcessingAction}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-cyan-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Extend Access
                  </button>

                  {!perm.revoked && (
                    <button
                      onClick={() => handleRevoke(perm.recipient)}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Revoke Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extend Duration Modal */}
      {extendingRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-cyan-400" />
                Extend Access Duration
              </h3>
              <button
                onClick={() => setExtendingRecipient(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400">Target Recipient:</span>
                <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 font-mono text-cyan-300 break-all text-[11px]">
                  {extendingRecipient}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-300 font-medium">Select Additional Duration:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '+1 Hour', sec: 3600 },
                    { label: '+24 Hours', sec: 86400 },
                    { label: '+7 Days', sec: 604800 },
                    { label: '+30 Days', sec: 2592000 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => setExtensionDuration(preset.sec)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                        extensionDuration === preset.sec
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-gray-400 bg-gray-950/60 p-3 rounded-xl border border-gray-800/80">
                If the permission is currently active, this time is appended to the existing expiry date.
                If already expired or revoked, it will be renewed starting from current block.timestamp.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendingRecipient(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExtend}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-950 transition disabled:opacity-50"
                >
                  {isProcessingAction ? 'Submitting to BOT Chain...' : 'Confirm Extension'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

