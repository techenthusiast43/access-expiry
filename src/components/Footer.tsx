import React from 'react';
import { ShieldCheck, ExternalLink, Globe, BookOpen, Droplet } from 'lucide-react';
import { BOT_CHAIN_INFO } from '../config/chainConfig';
import { useWeb3 } from '../context/Web3Context';

export const Footer: React.FC = () => {
  const { contractAddress } = useWeb3();

  return (
    <footer className="border-t border-gray-800/80 bg-gray-950/80 backdrop-blur-md mt-auto py-8 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Brand */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white text-sm">AccessExpiry</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                BOT Chain Testnet
              </span>
            </div>
            <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
              Decentralized, self-expiring temporary access control powered by Solidity smart contracts
              and BOT Chain's high-speed EVM layer.
            </p>
            <div className="pt-2 font-mono text-[11px] text-gray-500 break-all">
              Contract:{' '}
              <a
                href={`${BOT_CHAIN_INFO.blockExplorerUrl}/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {contractAddress}
              </a>
            </div>
          </div>

          {/* Network Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px]">
              BOT Chain Resources
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={BOT_CHAIN_INFO.blockExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 flex items-center gap-1 transition"
                >
                  <Globe className="w-3.5 h-3.5" /> BOT Chain Explorer
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href={BOT_CHAIN_INFO.faucetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 flex items-center gap-1 transition"
                >
                  <Droplet className="w-3.5 h-3.5" /> Testnet Faucet (tBOT)
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a
                  href={BOT_CHAIN_INFO.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 flex items-center gap-1 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Developer Documentation
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Specifications */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px]">
              Network Specs
            </h4>
            <div className="space-y-1 font-mono text-[11px] text-gray-400">
              <div>Chain ID: <span className="text-white">968</span></div>
              <div>RPC: <span className="text-white">rpc.bohr.life</span></div>
              <div>Token: <span className="text-cyan-400 font-semibold">BOT</span></div>
              <div>Total Supply: <span className="text-white">150M</span></div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} AccessExpiry. Open-source decentralized access protocol on BOT Chain.
          </div>
          <div className="flex items-center gap-3">
            <span>Non-custodial</span>
            <span>•</span>
            <span>Zero tokens / No fees</span>
            <span>•</span>
            <span>Trustless Expiry</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

