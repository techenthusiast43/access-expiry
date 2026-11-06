import React from 'react';
import {
  ShieldCheck,
  Clock,
  KeyRound,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { account, connectWallet, isCorrectNetwork, switchToBotChain } = useWeb3();

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-gray-900/90 via-gray-950 to-[#080d1a] p-8 sm:p-14 text-center">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Deployed on BOT Chain Testnet (Chain ID 968)
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Self-Expiring Web3 Access Control on{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              BOT Chain
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Grant temporary, time-bounded permissions to wallet addresses without intermediaries.
            Permissions automatically expire on-chain using <code className="text-cyan-400 bg-gray-900 px-1 py-0.5 rounded font-mono text-xs">block.timestamp</code>,
            eliminating forgotten access credentials and authorization leaks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {account ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition transform hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition transform hover:-translate-y-0.5"
              >
                Connect Wallet <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigate('check')}
              className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-semibold text-sm flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4 text-cyan-400" /> Verify Access
            </button>

            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 text-gray-300 font-semibold text-sm flex items-center gap-2 transition"
            >
              <KeyRound className="w-4 h-4 text-teal-400" /> Register Resource
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-gray-800/80 text-left">
            <div>
              <div className="text-xl font-bold font-mono text-white">0%</div>
              <div className="text-xs text-gray-400">Token Fees / Tolls</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-cyan-400">100%</div>
              <div className="text-xs text-gray-400">On-Chain Expiry</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-white">968</div>
              <div className="text-xs text-gray-400">BOT Chain ID</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-emerald-400">&lt; 1s</div>
              <div className="text-xs text-gray-400">Verification Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">How AccessExpiry Works</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            A simple, deterministic 4-step lifecycle for time-bound authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/60 border border-gray-800/90 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold mb-4 font-mono">
              01
            </div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Register Resource
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Create a unique resource identifier (e.g. for an API endpoint, data room, or service role). You become its cryptographic owner.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/90 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold mb-4 font-mono">
              02
            </div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" /> Grant Temporary Access
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Designate a recipient wallet address and choose a preset duration (1 hour, 24 hours, 7 days, 30 days).
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/90 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 font-bold mb-4 font-mono">
              03
            </div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" /> Automatic Expiry
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              When <code className="text-cyan-300">block.timestamp &ge; expiryTimestamp</code>, the contract immediately revokes validity. No cleanup cron required.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/90 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold mb-4 font-mono">
              04
            </div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Manual Control
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Resource owners retain sovereign authority to extend access duration or prematurely revoke permissions at any moment.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison / Highlights */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Ultra-Low Gas on BOT Chain</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Engineered with packed Solidity structs, custom errors, and event-driven logging to keep execution overhead minimal on BOT Chain testnet.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Zero Private Data On-Chain</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No private keys, passwords, or confidential payloads are ever stored in the contract. Only cryptographic hashes and wallet addresses are recorded.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Real-Time Verification API</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              External dApps, microservices, and gateway proxies can query the view function <code className="text-cyan-300">hasAccess(resourceId, address)</code> with zero gas cost.
            </p>
          </div>
        </div>
      </section>

      {/* Network Specs Banner */}
      <section className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-semibold text-white">Need testnet BOT tokens to get started?</h4>
          <p className="text-xs text-gray-400">
            Request testnet tokens from the official BOT Chain Faucet to register resources and grant permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={BOT_CHAIN_INFO.faucetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            Open BOT Faucet <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={BOT_CHAIN_INFO.blockExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            Explorer <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
};

