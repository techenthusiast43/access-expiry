import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { BOT_CHAIN_INFO } from '../config/chainConfig';
import { ethers } from 'ethers';

interface ConnectWalletPageProps {
  onNavigate: (tab: string) => void;
}

export const ConnectWalletPage: React.FC<ConnectWalletPageProps> = ({ onNavigate }) => {
  const {
    account,
    chainId,
    isCorrectNetwork,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToBotChain,
  } = useWeb3();

  const [balance, setBalance] = useState<string>('0');
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchBalance = async () => {
    if (!account) return;
    try {
      setIsRefreshingBalance(true);
      const provider = new ethers.JsonRpcProvider(BOT_CHAIN_INFO.rpcUrl);
      const rawBalance = await provider.getBalance(account);
      setBalance(Number(ethers.formatEther(rawBalance)).toFixed(4));
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [account, chainId]);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2.5">
          <Wallet className="w-7 h-7 text-cyan-400" />
          Connect & Network Configuration
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Connect your Web3 EVM wallet and verify BOT Chain testnet connection parameters.
        </p>
      </div>

      {/* Main Connection Card */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
        {account ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Wallet Connected</h3>
                  <p className="text-xs text-gray-400">Ready for on-chain transactions</p>
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
              >
                Disconnect
              </button>
            </div>

            {/* Wallet Address Box */}
            <div className="space-y-1">
              <span className="text-xs text-gray-400">Active Account Address:</span>
              <div className="flex items-center justify-between bg-gray-950 p-3 rounded-xl border border-gray-800 font-mono text-xs">
                <span className="text-cyan-300 break-all">{account}</span>
                <button
                  onClick={copyAddress}
                  className="ml-3 p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-900 border border-gray-700 transition shrink-0"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Balance & Network Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">BOT Chain Balance:</span>
                  <button
                    onClick={fetchBalance}
                    disabled={isRefreshingBalance}
                    className="text-gray-400 hover:text-cyan-400 transition"
                    title="Refresh Balance"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {balance} <span className="text-cyan-400 text-sm">tBOT</span>
                </div>
                {Number(balance) === 0 && (
                  <p className="text-[11px] text-amber-400 pt-1">
                    Your balance is 0. Please request tBOT tokens to execute write transactions.
                  </p>
                )}
              </div>

              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-1">
                <span className="text-xs text-gray-400">Network Verification:</span>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCorrectNetwork ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-sm font-semibold text-white">
                    {isCorrectNetwork ? 'BOT Chain Testnet' : `Wrong Chain (ID: ${chainId})`}
                  </span>
                </div>
                {!isCorrectNetwork && (
                  <button
                    onClick={switchToBotChain}
                    className="text-xs text-cyan-400 hover:underline pt-1 block font-medium"
                  >
                    Click to switch to Chain ID 968
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                Go to Owner Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-xs transition"
              >
                Register a Resource
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-white">Connect Your EVM Wallet</h3>
              <p className="text-xs text-gray-400">
                Connect MetaMask, Coinbase Wallet, Rabby, or any compatible browser wallet to interact with BOT Chain.
              </p>
            </div>
            <div>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-950 transition disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect MetaMask / Web3 Wallet'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Official BOT Chain Network Parameters */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Official BOT Chain Testnet Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Network Name:</span>
            <span className="text-white font-semibold">{BOT_CHAIN_INFO.name}</span>
          </div>
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Chain ID:</span>
            <span className="text-cyan-400 font-bold">968 (Hex: 0x3c8)</span>
          </div>
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">RPC Endpoint:</span>
            <span className="text-gray-200">https://rpc.bohr.life</span>
          </div>
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Native Token Symbol:</span>
            <span className="text-teal-400 font-bold">{BOT_CHAIN_INFO.currencySymbol}</span>
          </div>
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Total Supply:</span>
            <span className="text-gray-200">{BOT_CHAIN_INFO.totalSupply}</span>
          </div>
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400">Block Explorer:</span>
            <a
              href={BOT_CHAIN_INFO.blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              scan.bohr.life <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs">
          <span className="text-gray-400">Need testnet BOT tokens?</span>
          <a
            href={BOT_CHAIN_INFO.faucetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1.5 transition"
          >
            Claim from Testnet Faucet <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

