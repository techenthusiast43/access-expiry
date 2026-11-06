import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Web3Provider } from './context/Web3Context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { botChainTestnet, BOT_CHAIN_INFO } from './config/chainConfig';

// 1. Initialize TanStack Query Client
const queryClient = new QueryClient();

// 2. Project ID from Reown Cloud (or fallback demo ID)
const envProjectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID;
const projectId = (envProjectId && envProjectId.trim()) || 'c432029ca2eb16d00fffa27236319409';

// 3. Setup Wagmi adapter and config for BOT Chain Testnet
const wagmiAdapter = new WagmiAdapter({
  networks: [botChainTestnet],
  projectId,
  transports: {
    [botChainTestnet.id]: http(BOT_CHAIN_INFO.rpcUrl),
  },
});

// 4. Create Reown AppKit Modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [botChainTestnet],
  projectId,
  metadata: {
    name: 'AccessExpiry',
    description: 'Self-Expiring Web3 Access Control on BOT Chain Testnet',
    url: 'https://scan.bohr.life',
    icons: ['https://scan.bohr.life/favicon.ico'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00F0FF',
    '--w3m-color-mix': '#080d1a',
    '--w3m-color-mix-strength': 40,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <App />
        </Web3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

