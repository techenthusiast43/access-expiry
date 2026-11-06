import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, X } from 'lucide-react';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

export interface TxStatus {
  state: 'idle' | 'pending' | 'success' | 'error';
  title?: string;
  message?: string;
  hash?: string;
  errorMessage?: string;
}

interface TxNotificationProps {
  status: TxStatus;
  onClose: () => void;
}

export const TxNotification: React.FC<TxNotificationProps> = ({ status, onClose }) => {
  if (status.state === 'idle') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up shadow-2xl">
      <div className="bg-gray-900 border border-gray-700/80 rounded-xl p-4 backdrop-blur-xl relative shadow-cyan-950/20">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          {status.state === 'pending' && (
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          {status.state === 'success' && (
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {status.state === 'error' && (
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 pr-6">
            <h4 className="text-sm font-semibold text-white">
              {status.title ||
                (status.state === 'pending'
                  ? 'Transaction Pending'
                  : status.state === 'success'
                  ? 'Transaction Confirmed'
                  : 'Transaction Failed')}
            </h4>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              {status.message ||
                (status.state === 'pending'
                  ? 'Waiting for block confirmation on BOT Chain testnet...'
                  : status.state === 'success'
                  ? 'Your action has been confirmed on-chain.'
                  : status.errorMessage || 'An error occurred while executing the transaction.')}
            </p>

            {status.hash && (
              <a
                href={`${BOT_CHAIN_INFO.blockExplorerUrl}/tx/${status.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                View on BOT Scan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

