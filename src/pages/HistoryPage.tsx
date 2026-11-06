import React, { useState, useEffect } from 'react';
import {
  History,
  KeyRound,
  XCircle,
  CalendarPlus,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { HistoryEvent } from '../types';
import { BOT_CHAIN_INFO } from '../config/chainConfig';

export const HistoryPage: React.FC = () => {
  const { loadHistoryEvents, contractAddress } = useWeb3();

  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'ALL' | 'GRANT' | 'REVOKE' | 'EXTEND' | 'REGISTER'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const list = await loadHistoryEvents();
      setEvents(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const copyTx = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTx(hash);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType !== 'ALL' && ev.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const matchHash = ev.txHash.toLowerCase().includes(term);
      const matchRecipient = ev.recipient?.toLowerCase().includes(term) || false;
      const matchOwner = ev.owner?.toLowerCase().includes(term) || false;
      const matchResource = ev.resourceId.toLowerCase().includes(term);
      if (!matchHash && !matchRecipient && !matchOwner && !matchResource) {
        return false;
      }
    }
    return true;
  });

  const getEventBadge = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'GRANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <KeyRound className="w-3.5 h-3.5" /> Access Granted
          </span>
        );
      case 'REVOKE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Access Revoked
          </span>
        );
      case 'EXTEND':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <CalendarPlus className="w-3.5 h-3.5" /> Access Extended
          </span>
        );
      case 'REGISTER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <PlusCircle className="w-3.5 h-3.5" /> Resource Created
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-cyan-400" />
            Audit History & Event Trail
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Immutable on-chain event logs queryable directly from BOT Chain Testnet.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-cyan-400 transition self-start sm:self-auto"
          title="Refresh Events"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Filter by Event Type
            </label>
            <div className="flex flex-wrap gap-1.5 bg-gray-950 p-1.5 rounded-xl border border-gray-800 text-xs">
              {(['ALL', 'GRANT', 'REVOKE', 'EXTEND', 'REGISTER'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filterType === type
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All Events' : type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Search by Tx Hash, Recipient, or Resource ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search 0x..."
                className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Displaying {filteredEvents.length} event records
          </span>
          <a
            href={`${BOT_CHAIN_INFO.blockExplorerUrl}/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            Contract on BOT Scan <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {isLoading ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            <span className="text-xs">Scanning BOT Chain testnet event logs...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-2xl p-12 text-center space-y-3">
            <History className="w-8 h-8 text-gray-600 mx-auto" />
            <div className="text-sm font-semibold text-white">No Event Records Found</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchTerm || filterType !== 'ALL'
                ? 'No events match the current filter parameters.'
                : 'No registration, grant, revoke, or extend events have been recorded yet in recent blocks.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-gray-900/70 border border-gray-800/90 hover:border-gray-700 rounded-2xl p-4 sm:p-5 transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getEventBadge(ev.type)}
                    <span className="text-gray-400 text-[11px]">
                      Block #{ev.blockNumber}
                    </span>
                  </div>

                  <div className="space-y-1 text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Resource:</span>
                      <span className="text-cyan-400 break-all select-all">
                        {ev.resourceId.slice(0, 16)}...{ev.resourceId.slice(-8)}
                      </span>
                    </div>

                    {ev.recipient && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Recipient:</span>
                        <span className="text-white break-all">{ev.recipient}</span>
                      </div>
                    )}

                    {ev.owner && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Owner/Grantor:</span>
                        <span className="text-gray-400 break-all">{ev.owner}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Tx Hash & Explorer Link */}
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  <a
                    href={`${BOT_CHAIN_INFO.blockExplorerUrl}/tx/${ev.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <span>Tx: {ev.txHash.slice(0, 10)}...</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => copyTx(ev.txHash)}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Copy Tx Hash"
                  >
                    {copiedTx === ev.txHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

