import React, { useState } from 'react';
import {
  ShieldCheck,
  Wallet,
  ExternalLink,
  ChevronDown,
  Copy,
  Check,
  Settings,
  Layers,
  PlusCircle,
  KeyRound,
  Users2,
  Search,
  History,
  Home
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    account,
    chainId,
    isCorrectNetwork,
    isConnecting,
    contractAddress,
    setContractAddress,
    connectWallet,
    disconnectWallet,
    switchToBotChain,
  } = useWeb3();

  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [tempContractAddress, setTempContractAddress] = useState(contractAddress);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'register', label: 'Register', icon: PlusCircle },
    { id: 'grant', label: 'Grant Access', icon: KeyRound },
    { id: 'manage', label: 'Manage', icon: Users2 },
    { id: 'check', label: 'Verify Access', icon: Search },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-md border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => setActiveTab('landing')}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1.5px] transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-950"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-cyan-400 bg-clip-text text-transparent">
                    AccessExpiry
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                    BOT
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 -mt-0.5 hidden sm:inline">
                  Decentralized Time-Bound Access
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Network Pill & Wallet */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Network Indicator */}
              <div className="hidden md:flex items-center gap-2 bg-gray-900 border border-gray-800 px-2.5 py-1.5 rounded-lg text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCorrectNetwork ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
                  }`}
                ></span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {isCorrectNetwork ? 'BOT Chain (968)' : `Chain ${chainId || 'Offline'}`}
                </span>
                <a
                  href={BOT_CHAIN_INFO.faucetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold ml-1"
                  title="Claim free testnet BOT"
                >
                  Faucet
                </a>
              </div>

              {/* Contract Settings Modal Trigger */}
              <button
                onClick={() => setShowConfig(!showConfig)}
                title="Contract Configuration"
                className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-gray-700 transition"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Wallet Button */}
              {account ? (
                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 hover:border-cyan-500/40 rounded-lg p-1 sm:px-2.5 sm:py-1.5 transition">
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1.5 font-mono text-xs text-cyan-300 hover:text-cyan-200"
                    title="Click to copy address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span>
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="text-[11px] text-gray-400 hover:text-rose-400 px-1.5 py-0.5 rounded ml-1 transition"
                    title="Disconnect"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-semibold text-xs transition duration-150 shadow-md shadow-cyan-950/40 disabled:opacity-50"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-gray-800 bg-gray-950/60 no-scrollbar text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 whitespace-nowrap rounded ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Contract Settings Popover */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                Contract & Network Configuration
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Target Deployed Contract Address (BOT Chain Testnet)
                </label>
                <input
                  type="text"
                  value={tempContractAddress}
                  onChange={(e) => setTempContractAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Enter your deployed contract address or keep the default deployment.
                </p>
              </div>

              <div className="p-3 bg-gray-950/80 rounded-lg border border-gray-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-gray-200">BOT Chain Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain ID:</span>
                  <span className="text-cyan-400 font-bold">968 (0x3c8)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RPC Endpoint:</span>
                  <span className="text-gray-300">https://rpc.bohr.life</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Native Token:</span>
                  <span className="text-gray-200">BOT (150M Supply)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Block Explorer:</span>
                  <a
                    href={BOT_CHAIN_INFO.blockExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    scan.bohr.life <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContractAddress(tempContractAddress.trim());
                    setShowConfig(false);
                  }}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg shadow-sm"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

