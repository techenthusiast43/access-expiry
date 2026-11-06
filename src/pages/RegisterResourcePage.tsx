import React, { useState, useEffect } from 'react';
import { PlusCircle, Layers, ShieldCheck, Sparkles, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

interface RegisterResourcePageProps {
  onNavigate: (tab: string, resourceId?: string) => void;
}

export const RegisterResourcePage: React.FC<RegisterResourcePageProps> = ({ onNavigate }) => {
  const { account, registerResource, connectWallet, isCorrectNetwork, switchToBotChain } = useWeb3();

  const [resourceName, setResourceName] = useState('');
  const [customIdMode, setCustomIdMode] = useState(false);
  const [customId, setCustomId] = useState('');
  const [previewId, setPreviewId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRegistered, setLastRegistered] = useState<{ id: string; txHash?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute live preview of resourceId
  useEffect(() => {
    if (customIdMode && customId.trim()) {
      if (customId.startsWith('0x') && customId.length === 66) {
        setPreviewId(customId);
      } else {
        // Hash custom string
        setPreviewId(ethers.keccak256(ethers.toUtf8Bytes(customId.trim())));
      }
    } else if (resourceName.trim() && account) {
      // Keccak256 hash of address + name + salt preview
      const preview = ethers.keccak256(
        ethers.toUtf8Bytes(`${account.toLowerCase()}:${resourceName.trim()}`)
      );
      setPreviewId(preview);
    } else {
      setPreviewId('');
    }
  }, [resourceName, customId, customIdMode, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName.trim()) {
      alert('Please enter a valid resource name.');
      return;
    }
    if (!account) {
      await connectWallet();
      return;
    }
    if (!isCorrectNetwork) {
      await switchToBotChain();
      return;
    }

    try {
      setIsSubmitting(true);
      let idParam: string | undefined = undefined;
      if (customIdMode && previewId) {
        idParam = previewId;
      }

      const res = await registerResource(resourceName.trim(), idParam);
      if (res.success && res.resourceId) {
        setLastRegistered({
          id: res.resourceId,
          txHash: res.txHash,
        });
        setResourceName('');
        setCustomId('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <PlusCircle className="w-7 h-7 text-cyan-400" />
          Register New Resource
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Register an access-protected resource on BOT Chain. Your wallet will be designated as the immutable owner.
        </p>
      </div>

      {/* Success Banner if just registered */}
      {lastRegistered && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            Resource successfully created and confirmed on BOT Chain!
          </div>
          <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Resource ID (bytes32):</span>
              <button
                onClick={() => copyId(lastRegistered.id)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy ID
              </button>
            </div>
            <div className="text-cyan-300 break-all select-all">{lastRegistered.id}</div>
            {lastRegistered.txHash && (
              <div className="pt-1 text-[11px] text-gray-500">
                Tx:{' '}
                <a
                  href={`${BOT_CHAIN_INFO.blockExplorerUrl}/tx/${lastRegistered.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  {lastRegistered.txHash.slice(0, 16)}...
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onNavigate('grant', lastRegistered.id)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              Grant Access to this Resource <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLastRegistered(null)}
              className="px-3 py-2 text-gray-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Resource Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g. Production API Gateway, Dataset Alpha, Secure Enclave"
              className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              A human-readable label identifying this resource. Publicly visible on-chain.
            </p>
          </div>

          {/* Custom ID toggle */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customIdMode}
                  onChange={(e) => setCustomIdMode(e.target.checked)}
                  className="rounded border-gray-700 text-cyan-500 focus:ring-cyan-500 bg-gray-950 w-4 h-4"
                />
                Provide Custom Resource Identifier (Optional)
              </label>
              <span className="text-[10px] text-gray-500 font-mono">Default: Auto-generated keccak256</span>
            </div>

            {customIdMode && (
              <div className="mt-3 space-y-1.5 animate-fade-in">
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="Enter a custom 32-byte hex or string identifier"
                  className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-gray-600"
                />
                <p className="text-[11px] text-gray-500">
                  Provide a 66-character 0x-prefixed hex string, or any string which will be automatically hashed.
                </p>
              </div>
            )}
          </div>

          {/* Live ID Preview Box */}
          {previewId && (
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/80 space-y-1 font-mono text-xs">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Target Resource ID:
              </div>
              <div className="text-cyan-400 break-all select-all text-[11px] font-semibold">
                {previewId}
              </div>
            </div>
          )}
        </div>

        {/* Ownership Notice */}
        <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-gray-300 space-y-1">
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Sovereign Resource Ownership
          </div>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            The creator wallet address ({account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'your connected wallet'})
            will become the sole owner of this resource. Only you will be authorized to grant, extend, or revoke permissions.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !resourceName.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-950/40 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Confirming on BOT Chain...'
            : account
            ? 'Register Resource on BOT Chain'
            : 'Connect Wallet to Register'}
        </button>
      </form>
    </div>
  );
};

