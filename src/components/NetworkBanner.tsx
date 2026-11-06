import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface NetworkBannerProps {
  currentChainId: number | null;
  onSwitchNetwork: () => void;
  isSwitching?: boolean;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({
  currentChainId,
  onSwitchNetwork,
  isSwitching = false,
}) => {
  if (!currentChainId || currentChainId === BOT_CHAIN_INFO.chainId) {
    return null;
  }

  return (
    <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2.5 text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Wrong Network Detected!</strong> You are connected to Chain ID {currentChainId}. AccessExpiry runs on <strong>BOT Chain Testnet (Chain ID 968)</strong>.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={BOT_CHAIN_INFO.faucetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
          >
            Get Testnet BOT <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onSwitchNetwork}
            disabled={isSwitching}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded text-xs transition duration-150 disabled:opacity-50"
          >
            {isSwitching ? 'Switching...' : 'Switch to BOT Chain Testnet'}
          </button>
        </div>
      </div>
    </div>
  );
};

