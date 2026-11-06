import React, { useState, useEffect } from 'react';
import {
  Layers,
  KeyRound,
  Users2,
  Clock,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { Resource } from '../types';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface DashboardPageProps {
  onNavigate: (tab: string, resourceId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { account, loadOwnedResources, connectWallet } = useWeb3();

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const list = await loadOwnedResources();
      setResources(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchResources();
    } else {
      setIsLoading(false);
      setResources([]);
    }
  }, [account]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Owner Dashboard</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Connect your wallet to inspect your registered resources, monitor granted permissions, and execute revocations or extensions on BOT Chain.
          </p>
        </div>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-950"
        >
          Connect Wallet to View Dashboard
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
            <Layers className="w-7 h-7 text-cyan-400" />
            Owner Dashboard
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Overview of your registered resources and active access delegations on BOT Chain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchResources}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-cyan-400 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-cyan-950 transition"
          >
            <PlusCircle className="w-4 h-4" /> Register New Resource
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Registered Resources</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {isLoading ? '...' : resources.length}
          </div>
          <div className="text-[11px] text-gray-500">Created by your wallet address</div>
        </div>

        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Network Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">BOT Chain (968)</div>
          <div className="text-[11px] text-gray-500">rpc.bohr.life • Live</div>
        </div>

        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Access Expiry Engine</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">Trustless</div>
          <div className="text-[11px] text-gray-500">Driven purely by block.timestamp</div>
        </div>
      </div>

      {/* Owned Resources Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Your Resources ({resources.length})
        </h2>

        {isLoading ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            <span className="text-xs">Querying BOT Chain testnet for registered resources...</span>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center text-gray-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-semibold text-white">No Resources Registered Yet</h3>
              <p className="text-xs text-gray-400">
                You haven't registered any access-protected resources on BOT Chain with this wallet.
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" /> Register Your First Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div
                key={res.id}
                className="bg-gray-900/80 border border-gray-800 hover:border-cyan-500/30 rounded-2xl p-5 space-y-4 transition shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {res.name}
                    </h3>
                    <div className="text-[11px] text-gray-400">
                      Created: {new Date(res.createdAt * 1000).toLocaleString()}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active Resource
                  </span>
                </div>

                {/* Resource ID Box */}
                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800/80 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Resource ID:</span>
                    <button
                      onClick={() => copyId(res.id)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                    >
                      {copiedId === res.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy
                    </button>
                  </div>
                  <div className="text-cyan-300 break-all select-all text-[11px]">
                    {res.id}
                  </div>
                </div>

                {/* Resource Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
                  <button
                    onClick={() => onNavigate('grant', res.id)}
                    className="flex-1 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Grant Access
                  </button>
                  <button
                    onClick={() => onNavigate('manage', res.id)}
                    className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Users2 className="w-3.5 h-3.5" /> Manage Permissions
                  </button>
                  <a
                    href={`${BOT_CHAIN_INFO.blockExplorerUrl}/address/${res.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition"
                    title="View Owner on BOT Scan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

