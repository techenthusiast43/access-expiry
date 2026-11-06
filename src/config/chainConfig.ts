import { defineChain } from 'viem';

export const BOT_TESTNET_CHAIN_ID = 968;

export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOT Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

export const BOT_CHAIN_INFO = {
  chainId: 968,
  chainIdHex: '0x3c8',
  name: 'BOT Chain Testnet',
  rpcUrl: 'https://rpc.bohr.life',
  currencySymbol: 'BOT',
  tokenDecimals: 18,
  totalSupply: '150 Million',
  blockExplorerUrl: 'https://scan.bohr.life',
  faucetUrl: 'https://faucet.botchain.ai/basic',
  docsUrl: 'https://dev-docs.botchain.ai/docs/Developers/quick-guide/',
};

// Default deployed contract address on BOT Chain Testnet
// Can be overridden via VITE_CONTRACT_ADDRESS environment variable
export const DEFAULT_CONTRACT_ADDRESS = 
  (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '0xd3f3e482e065Af680862a673b42E1EA44bFDeA2D';

