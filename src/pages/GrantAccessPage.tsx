import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Resource } from '../types';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface GrantAccessPageProps {
  initialResourceId?: string;
  onNavigate: (tab: string, resourceId?: string) => void;
}

const DURATION_PRESETS = [
  { label: '1 Hour', seconds: 3600, badge: 'Testing' },
  { label: '24 Hours', seconds: 86400, badge: 'Standard' },
  { label: '7 Days', seconds: 604800, badge: 'Weekly' },
  { label: '30 Days', seconds: 2592000, badge: 'Monthly' },
];

export const GrantAccessPage: React.FC<GrantAccessPageProps> = ({
  initialResourceId,
  onNavigate,
}) => {
  const {
    account,
    grantAccess,
    loadOwnedResources,
    connectWallet,
    isCorrectNetwork,
    switchToBotChain,
  } = useWeb3();

  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(initialResourceId || '');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(86400); // 24 hours default
  const [customHours, setCustomHours] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Address validation
  const isValidAddress =
    recipientAddress.trim() !== '' &&
    ethers.isAddress(recipientAddress.trim()) &&
    recipientAddress.trim() !== ethers.ZeroAddress;

  const isSelfGrant =
    account &&
    recipientAddress.trim().toLowerCase() === account.toLowerCase();

  useEffect(() => {
    if (initialResourceId) {
      setSelectedResourceId(initialResourceId);
    }
  }, [initialResourceId]);

  useEffect(() => {
    const fetchResources = async () => {
      if (account) {
        const list = await loadOwnedResources();
        setResources(list);
        if (!selectedResourceId && list.length > 0) {
          setSelectedResourceId(list[0].id);
        }
      }
    };
    fetchResources();
  }, [account]);

  const effectiveDuration = isCustom
    ? Math.max(1, Number(customHours) || 0) * 3600
    : selectedDuration;

  const computedExpiryDate = new Date(Date.now() + effectiveDuration * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      await connectWallet();
      return;
    }
    if (!isCorrectNetwork) {
      await switchToBotChain();
      return;
    }
    if (!selectedResourceId) {
      alert('Please select or specify a Resource ID.');
      return;
    }
    if (!isValidAddress) {
      alert('Please enter a valid, non-zero EVM recipient address.');
      return;
    }
    if (effectiveDuration <= 0) {
      alert('Duration must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await grantAccess(
        selectedResourceId,
        recipientAddress.trim(),
        effectiveDuration
      );

      if (res.success && res.txHash) {
        setLastTxHash(res.txHash);
        setRecipientAddress('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <KeyRound className="w-7 h-7 text-cyan-400" />
          Grant Temporary Access
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Issue a time-bounded permission credential on BOT Chain for an authorized wallet address.
        </p>
      </div>

      {/* Success Notification */}
      {lastTxHash && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            Temporary permission successfully granted on BOT Chain!
          </div>
          <div className="text-xs text-gray-300">
            Transaction Hash:{' '}
            <a
              href={`${BOT_CHAIN_INFO.blockExplorerUrl}/tx/${lastTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 font-mono underline ml-1 inline-flex items-center gap-1"
            >
              {lastTxHash.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onNavigate('manage', selectedResourceId)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              View Active Permissions <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLastTxHash(null)}
              className="px-3 py-2 text-gray-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Grant Access Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md"
      >
        {/* Resource Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Select Resource <span className="text-rose-400">*</span>
          </label>

          {resources.length > 0 ? (
            <div className="space-y-2">
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id.slice(0, 10)}...{r.id.slice(-8)})
                  </option>
                ))}
              </select>
              <div className="text-[11px] font-mono text-cyan-400/80 break-all bg-gray-950 p-2.5 rounded-lg border border-gray-800/80">
                Selected ID: {selectedResourceId}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                placeholder="Enter 32-byte Resource ID (0x...)"
                className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600"
              />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">No resources detected for this account.</span>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-cyan-400 hover:underline"
                >
                  Register a Resource First
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recipient Wallet Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Recipient Wallet Address <span className="text-rose-400">*</span>
            </label>
            {recipientAddress && (
              <span
                className={`text-[11px] font-mono flex items-center gap-1 ${
                  isValidAddress ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isValidAddress ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" /> Valid EVM Address
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Invalid Address Format
                  </>
                )}
              </span>
            )}
          </div>

          <input
            type="text"
            required
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x1234...5678"
            className={`w-full bg-gray-950 border rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-600 focus:outline-none transition ${
              recipientAddress && !isValidAddress
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
            }`}
          />
          {isSelfGrant && (
            <p className="text-[11px] text-amber-400">
              Note: You are granting access to your own wallet address.
            </p>
          )}
        </div>

        {/* Access Duration Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Access Duration <span className="text-rose-400">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DURATION_PRESETS.map((preset) => {
              const isSelected = !isCustom && selectedDuration === preset.seconds;
              return (
                <button
                  type="button"
                  key={preset.seconds}
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedDuration(preset.seconds);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{preset.badge}</div>
                </button>
              );
            })}
          </div>

          {/* Custom Duration Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              {isCustom ? '← Use Standard Presets' : '+ Custom Duration in Hours'}
            </button>

            {isCustom && (
              <div className="mt-2.5 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="e.g. 48"
                  className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono w-32 focus:border-cyan-500"
                />
                <span className="text-xs text-gray-400">hours ({Number(customHours) || 0}h)</span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Timestamp Preview */}
        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Computed Expiration Time:</span>
          </div>
          <div className="font-mono text-cyan-300 font-semibold text-sm">
            {computedExpiryDate.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500">
            Calculated as current block.timestamp + {effectiveDuration} seconds. Automatically expires on-chain.
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedResourceId || !isValidAddress}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-950/40 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Confirming Grant on BOT Chain...'
            : account
            ? 'Sign & Grant Access on BOT Chain'
            : 'Connect Wallet to Grant'}
        </button>
      </form>
    </div>
  );
};

