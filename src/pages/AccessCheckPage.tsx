import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { CountdownTimer } from '../components/CountdownTimer';
import { StatusBadge } from '../components/StatusBadge';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

export const AccessCheckPage: React.FC = () => {
  const { account, checkAccess, contractAddress } = useWeb3();

  const [resourceId, setResourceId] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    queried: boolean;
    hasAccess: boolean;
    perm?: any;
    secondsRemaining?: number;
    error?: string;
  } | null>(null);

  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleUseMyAddress = () => {
    if (account) {
      setTargetAddress(account);
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId.trim() || !targetAddress.trim()) {
      alert('Please provide both Resource ID and Wallet Address.');
      return;
    }

    if (!ethers.isAddress(targetAddress.trim())) {
      alert('Please provide a valid EVM wallet address.');
      return;
    }

    try {
      setIsChecking(true);
      setResult(null);

      // Clean resourceId
      let cleanId = resourceId.trim();
      if (!cleanId.startsWith('0x') || cleanId.length !== 66) {
        // If user typed string name, hash it
        cleanId = ethers.keccak256(ethers.toUtf8Bytes(cleanId));
      }

      const res = await checkAccess(cleanId, targetAddress.trim());
      setResult({
        queried: true,
        hasAccess: res.hasAccess,
        perm: res.perm,
        secondsRemaining: res.secondsRemaining,
      });
    } catch (err: any) {
      console.error(err);
      setResult({
        queried: true,
        hasAccess: false,
        error: 'Query failed. Please verify the Resource ID or contract address.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const solidityCodeSnippet = `// 3-Line Solidity Verification
interface IAccessExpiry {
    function hasAccess(bytes32 resourceId, address recipient) external view returns (bool);
}

bool authorized = IAccessExpiry(${contractAddress}).hasAccess(resourceId, msg.sender);
require(authorized, "Access expired or unauthorized");`;

  const copySnippet = () => {
    navigator.clipboard.writeText(solidityCodeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2.5">
          <Search className="w-7 h-7 text-cyan-400" />
          Verify Access Status
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
          Public, gas-free verification tool. Check whether any wallet holds active, unexpired access to a resource on BOT Chain.
        </p>
      </div>

      {/* Verification Query Form */}
      <form
        onSubmit={handleCheck}
        className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Resource ID (bytes32 hex or registered name) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="0x1a2b... or Resource Identifier"
              className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Target Wallet Address <span className="text-rose-400">*</span>
              </label>
              {account && (
                <button
                  type="button"
                  onClick={handleUseMyAddress}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Use Connected Address
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isChecking || !resourceId.trim() || !targetAddress.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-950/40 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          {isChecking ? 'Checking on BOT Chain...' : 'Verify hasAccess() Now'}
        </button>
      </form>

      {/* Verification Result Display */}
      {result && result.queried && (
        <div className="animate-slide-up">
          {result.hasAccess ? (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl shadow-emerald-950/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      ACCESS PERMITTED
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      Valid & Active Permission
                    </h3>
                  </div>
                </div>
                <StatusBadge status="Active" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-950/90 p-4 rounded-xl border border-emerald-900/40 font-mono text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Time Remaining:</span>
                  {result.perm && (
                    <CountdownTimer
                      expiryTimestamp={Number(result.perm.expiryTimestamp)}
                      isRevoked={result.perm.revoked}
                    />
                  )}
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Expiry Timestamp:</span>
                  <span className="text-cyan-300 font-bold">
                    {result.perm
                      ? new Date(Number(result.perm.expiryTimestamp) * 1000).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block mb-1">Grantor (Resource Owner):</span>
                  <span className="text-gray-300 break-all">
                    {result.perm ? result.perm.grantor : 'N/A'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300">
                The smart contract confirmed that <code className="text-emerald-400 font-mono">hasAccess() == true</code>.
                The recipient holds valid credentials until the specified expiry timestamp.
              </p>
            </div>
          ) : (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      ACCESS DENIED
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      Permission Invalid / Inactive
                    </h3>
                  </div>
                </div>
                <StatusBadge
                  status={
                    result.perm?.revoked
                      ? 'Revoked'
                      : result.perm?.exists
                      ? 'Expired'
                      : 'Expired'
                  }
                />
              </div>

              <div className="bg-gray-950/90 p-4 rounded-xl border border-rose-900/40 space-y-2 text-xs">
                <div className="text-gray-300">
                  {result.perm?.revoked ? (
                    <span className="text-rose-400 font-semibold">
                      Reason: This permission was manually revoked by the resource owner.
                    </span>
                  ) : result.perm?.exists ? (
                    <span className="text-amber-400 font-semibold">
                      Reason: The access duration has expired (block.timestamp &ge; expiryTimestamp).
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Reason: No permission record exists for this wallet address under the provided Resource ID.
                    </span>
                  )}
                </div>
                {result.perm?.exists && (
                  <div className="font-mono text-gray-400 text-[11px]">
                    Expired at:{' '}
                    {new Date(Number(result.perm.expiryTimestamp) * 1000).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Developer Integration Guide */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            Integrate with your Smart Contract or dApp
          </h3>
          <button
            onClick={copySnippet}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Solidity Code
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Any protocol or backend microservice on BOT Chain can verify permissions in a single read call:
        </p>
        <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
          {solidityCodeSnippet}
        </pre>
      </div>
    </div>
  );
};

