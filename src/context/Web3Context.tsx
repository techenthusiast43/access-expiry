import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { BOT_CHAIN_INFO, BOT_TESTNET_CHAIN_ID, DEFAULT_CONTRACT_ADDRESS } from '../config/chainConfig';
import { ACCESS_EXPIRY_ABI } from '../contracts/abi';
import { TxStatus } from '../components/TxNotification';
import { Resource, PermissionWithStatus, HistoryEvent } from '../types';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  contractAddress: string;
  setContractAddress: (addr: string) => void;
  txStatus: TxStatus;
  setTxStatus: React.Dispatch<React.SetStateAction<TxStatus>>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToBotChain: () => Promise<void>;

  // Contract Actions
  registerResource: (name: string, customIdHex?: string) => Promise<{ success: boolean; resourceId?: string; txHash?: string }>;
  grantAccess: (resourceId: string, recipient: string, durationSeconds: number) => Promise<{ success: boolean; txHash?: string }>;
  extendAccess: (resourceId: string, recipient: string, additionalSeconds: number) => Promise<{ success: boolean; txHash?: string }>;
  revokeAccess: (resourceId: string, recipient: string) => Promise<{ success: boolean; txHash?: string }>;

  // Read Actions
  checkAccess: (resourceId: string, recipient: string) => Promise<{ hasAccess: boolean; perm?: any; secondsRemaining?: number }>;
  loadOwnedResources: () => Promise<Resource[]>;
  loadPermissionsForResource: (resourceId: string) => Promise<PermissionWithStatus[]>;
  loadAllSystemResources: () => Promise<Resource[]>;
  loadHistoryEvents: () => Promise<HistoryEvent[]>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [contractAddress, setContractAddressState] = useState<string>(() => {
    return localStorage.getItem('access_expiry_contract') || DEFAULT_CONTRACT_ADDRESS;
  });
  const [txStatus, setTxStatus] = useState<TxStatus>({ state: 'idle' });

  const setContractAddress = (addr: string) => {
    setContractAddressState(addr);
    localStorage.setItem('access_expiry_contract', addr);
  };

  const isCorrectNetwork = chainId === BOT_TESTNET_CHAIN_ID;

  // Fallback read-only provider targeting official BOT Chain RPC
  const getReadOnlyProvider = useCallback(() => {
    return new ethers.JsonRpcProvider(BOT_CHAIN_INFO.rpcUrl);
  }, []);

  // Helper to ensure checksummed contract address
  const safeContractAddress = () => {
    try {
      return ethers.getAddress(contractAddress.trim());
    } catch {
      return contractAddress.trim();
    }
  };

  // Read-only contract instance
  const getReadOnlyContract = useCallback(() => {
    const provider = getReadOnlyProvider();
    const addr = safeContractAddress();
    return new ethers.Contract(addr, ACCESS_EXPIRY_ABI, provider);
  }, [contractAddress, getReadOnlyProvider]);

  // Signer-connected contract instance
  const getSignerContract = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No crypto wallet detected. Please install MetaMask or another Web3 wallet.');
    }
    const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await browserProvider.getSigner();
    const addr = safeContractAddress();
    return new ethers.Contract(addr, ACCESS_EXPIRY_ABI, signer);
  }, [contractAddress]);

  // Switch or add BOT Chain Testnet
  const switchToBotChain = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('No Web3 wallet found. Please install MetaMask.');
      return;
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BOT_CHAIN_INFO.chainIdHex }],
      });
    } catch (switchError: any) {
      // 4902 indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BOT_CHAIN_INFO.chainIdHex,
                chainName: BOT_CHAIN_INFO.name,
                rpcUrls: [BOT_CHAIN_INFO.rpcUrl],
                nativeCurrency: {
                  name: 'BOT',
                  symbol: BOT_CHAIN_INFO.currencySymbol,
                  decimals: BOT_CHAIN_INFO.tokenDecimals,
                },
                blockExplorerUrls: [BOT_CHAIN_INFO.blockExplorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add BOT Chain to wallet:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('MetaMask or Web3 wallet not detected. Please install an EVM wallet.');
      return;
    }

    try {
      setIsConnecting(true);
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        if (Number(network.chainId) !== BOT_TESTNET_CHAIN_ID) {
          await switchToBotChain();
        }
      }
    } catch (err: any) {
      console.error('Connect wallet failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  // Listen to account and network changes
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const { ethereum } = window as any;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    // Initial check
    ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      })
      .catch(console.error);

    ethereum
      .request({ method: 'eth_chainId' })
      .then((chainHex: string) => {
        setChainId(parseInt(chainHex, 16));
      })
      .catch(console.error);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // --- Contract Write Functions ---

  const registerResource = async (name: string, customIdHex?: string) => {
    try {
      setTxStatus({
        state: 'pending',
        title: 'Registering Resource',
        message: `Broadcasting transaction to register "${name}" on BOT Chain...`,
      });

      const contract = await getSignerContract();
      const idParam = customIdHex && customIdHex.startsWith('0x') && customIdHex.length === 66
        ? customIdHex
        : ethers.ZeroHash;

      const tx = await contract.registerResource(name, idParam);
      setTxStatus({
        state: 'pending',
        title: 'Transaction Submitted',
        message: 'Waiting for confirmation on BOT Chain testnet...',
        hash: tx.hash,
      });

      const receipt = await tx.wait();

      // Find ResourceRegistered event
      let registeredId = '';
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'ResourceRegistered') {
            registeredId = parsed.args[0];
            break;
          }
        } catch {
          // non-matching log
        }
      }

      setTxStatus({
        state: 'success',
        title: 'Resource Registered!',
        message: `Resource "${name}" registered successfully.`,
        hash: tx.hash,
      });

      return { success: true, resourceId: registeredId, txHash: tx.hash };
    } catch (err: any) {
      console.error('registerResource error:', err);
      const errMsg = err?.reason || err?.message || 'Transaction rejected or failed.';
      setTxStatus({
        state: 'error',
        title: 'Registration Failed',
        errorMessage: errMsg,
      });
      return { success: false };
    }
  };

  const grantAccess = async (resourceId: string, recipient: string, durationSeconds: number) => {
    try {
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient EVM wallet address.');
      }
      if (recipient === ethers.ZeroAddress) {
        throw new Error('Cannot grant access to the zero address (0x00...00).');
      }

      setTxStatus({
        state: 'pending',
        title: 'Granting Access',
        message: `Granting permission for recipient ${recipient.slice(0, 6)}... on BOT Chain.`,
      });

      const contract = await getSignerContract();
      const tx = await contract.grantAccess(resourceId, recipient, durationSeconds);

      setTxStatus({
        state: 'pending',
        title: 'Transaction Submitted',
        message: 'Waiting for confirmation on BOT Chain testnet...',
        hash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        state: 'success',
        title: 'Access Granted Successfully!',
        message: `Temporary access granted for ${durationSeconds} seconds.`,
        hash: tx.hash,
      });

      return { success: true, txHash: tx.hash };
    } catch (err: any) {
      console.error('grantAccess error:', err);
      const errMsg = err?.reason || err?.message || 'Failed to grant access.';
      setTxStatus({
        state: 'error',
        title: 'Grant Failed',
        errorMessage: errMsg,
      });
      return { success: false };
    }
  };

  const extendAccess = async (resourceId: string, recipient: string, additionalSeconds: number) => {
    try {
      setTxStatus({
        state: 'pending',
        title: 'Extending Access',
        message: `Extending duration by ${additionalSeconds} seconds on BOT Chain...`,
      });

      const contract = await getSignerContract();
      const tx = await contract.extendAccess(resourceId, recipient, additionalSeconds);

      setTxStatus({
        state: 'pending',
        title: 'Transaction Submitted',
        message: 'Waiting for extension confirmation on BOT Chain...',
        hash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        state: 'success',
        title: 'Access Extended!',
        message: `Permission extended successfully by ${additionalSeconds}s.`,
        hash: tx.hash,
      });

      return { success: true, txHash: tx.hash };
    } catch (err: any) {
      console.error('extendAccess error:', err);
      const errMsg = err?.reason || err?.message || 'Failed to extend access.';
      setTxStatus({
        state: 'error',
        title: 'Extension Failed',
        errorMessage: errMsg,
      });
      return { success: false };
    }
  };

  const revokeAccess = async (resourceId: string, recipient: string) => {
    try {
      setTxStatus({
        state: 'pending',
        title: 'Revoking Access',
        message: 'Submitting revocation to BOT Chain testnet...',
      });

      const contract = await getSignerContract();
      const tx = await contract.revokeAccess(resourceId, recipient);

      setTxStatus({
        state: 'pending',
        title: 'Transaction Submitted',
        message: 'Revocation in progress on BOT Chain...',
        hash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        state: 'success',
        title: 'Access Revoked!',
        message: 'Permission has been marked as revoked on-chain.',
        hash: tx.hash,
      });

      return { success: true, txHash: tx.hash };
    } catch (err: any) {
      console.error('revokeAccess error:', err);
      const errMsg = err?.reason || err?.message || 'Failed to revoke access.';
      setTxStatus({
        state: 'error',
        title: 'Revocation Failed',
        errorMessage: errMsg,
      });
      return { success: false };
    }
  };

  // --- Contract Read Functions ---

  const checkAccess = async (resourceId: string, recipient: string) => {
    try {
      const contract = getReadOnlyContract();
      const [perm, isActive, secondsRemaining] = await contract.getPermission(resourceId, recipient);
      return {
        hasAccess: Boolean(isActive),
        perm,
        secondsRemaining: Number(secondsRemaining),
      };
    } catch (err) {
      console.error('checkAccess query failed:', err);
      return { hasAccess: false };
    }
  };

  const loadOwnedResources = async (): Promise<Resource[]> => {
    if (!account) return [];
    try {
      const contract = getReadOnlyContract();
      const rawList = await contract.getResourcesByOwner(account);
      return rawList.map((item: any) => ({
        id: item.id,
        name: item.name,
        owner: item.owner,
        createdAt: Number(item.createdAt),
        exists: item.exists,
      }));
    } catch (err) {
      console.error('loadOwnedResources failed:', err);
      return [];
    }
  };

  const loadPermissionsForResource = async (resourceId: string): Promise<PermissionWithStatus[]> => {
    try {
      const contract = getReadOnlyContract();
      const rawList = await contract.getPermissionsByResource(resourceId);
      const now = Math.floor(Date.now() / 1000);

      return rawList.map((p: any) => {
        const expiry = Number(p.expiryTimestamp);
        const isRevoked = Boolean(p.revoked);
        const isExpired = now >= expiry;
        const isActive = Boolean(p.exists) && !isRevoked && !isExpired;

        let statusLabel: 'Active' | 'Expired' | 'Revoked' = 'Active';
        if (isRevoked) statusLabel = 'Revoked';
        else if (isExpired) statusLabel = 'Expired';

        const secondsRemaining = isActive ? expiry - now : 0;
        const formattedExpiry = new Date(expiry * 1000).toLocaleString();

        return {
          recipient: p.recipient,
          resourceId: p.resourceId,
          grantor: p.grantor,
          expiryTimestamp: expiry,
          revoked: isRevoked,
          exists: Boolean(p.exists),
          isActive,
          secondsRemaining,
          formattedExpiry,
          statusLabel,
        };
      });
    } catch (err) {
      console.error('loadPermissionsForResource failed:', err);
      return [];
    }
  };

  const loadAllSystemResources = async (): Promise<Resource[]> => {
    try {
      const contract = getReadOnlyContract();
      const rawList = await contract.getAllResources();
      return rawList.map((item: any) => ({
        id: item.id,
        name: item.name,
        owner: item.owner,
        createdAt: Number(item.createdAt),
        exists: item.exists,
      }));
    } catch (err) {
      console.error('loadAllSystemResources failed:', err);
      return [];
    }
  };

  const loadHistoryEvents = async (): Promise<HistoryEvent[]> => {
    try {
      const contract = getReadOnlyContract();
      const provider = getReadOnlyProvider();
      const currentBlock = await provider.getBlockNumber();
      // Scan last 5000 blocks or from genesis
      const fromBlock = Math.max(0, currentBlock - 5000);

      const [grantLogs, revokeLogs, extendLogs, regLogs] = await Promise.all([
        contract.queryFilter(contract.filters.AccessGranted(), fromBlock),
        contract.queryFilter(contract.filters.AccessRevoked(), fromBlock),
        contract.queryFilter(contract.filters.AccessExtended(), fromBlock),
        contract.queryFilter(contract.filters.ResourceRegistered(), fromBlock),
      ]);

      const events: HistoryEvent[] = [];

      for (const log of grantLogs) {
        const parsed = contract.interface.parseLog(log as any);
        if (parsed) {
          events.push({
            id: `${log.transactionHash}-${log.index}`,
            type: 'GRANT',
            resourceId: parsed.args[0],
            recipient: parsed.args[1],
            owner: parsed.args[2],
            expiryTimestamp: Number(parsed.args[3]),
            duration: Number(parsed.args[4]),
            timestamp: Math.floor(Date.now() / 1000), // block timestamp approx
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }
      }

      for (const log of revokeLogs) {
        const parsed = contract.interface.parseLog(log as any);
        if (parsed) {
          events.push({
            id: `${log.transactionHash}-${log.index}`,
            type: 'REVOKE',
            resourceId: parsed.args[0],
            recipient: parsed.args[1],
            owner: parsed.args[2],
            timestamp: Number(parsed.args[3]),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }
      }

      for (const log of extendLogs) {
        const parsed = contract.interface.parseLog(log as any);
        if (parsed) {
          events.push({
            id: `${log.transactionHash}-${log.index}`,
            type: 'EXTEND',
            resourceId: parsed.args[0],
            recipient: parsed.args[1],
            owner: parsed.args[4],
            expiryTimestamp: Number(parsed.args[3]),
            timestamp: Math.floor(Date.now() / 1000),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }
      }

      for (const log of regLogs) {
        const parsed = contract.interface.parseLog(log as any);
        if (parsed) {
          events.push({
            id: `${log.transactionHash}-${log.index}`,
            type: 'REGISTER',
            resourceId: parsed.args[0],
            resourceName: parsed.args[1],
            owner: parsed.args[2],
            timestamp: Number(parsed.args[3]),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }
      }

      // Sort newest first
      events.sort((a, b) => b.blockNumber - a.blockNumber);
      return events;
    } catch (err) {
      console.error('loadHistoryEvents failed:', err);
      return [];
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isCorrectNetwork,
        isConnecting,
        contractAddress,
        setContractAddress,
        txStatus,
        setTxStatus,
        connectWallet,
        disconnectWallet,
        switchToBotChain,
        registerResource,
        grantAccess,
        extendAccess,
        revokeAccess,
        checkAccess,
        loadOwnedResources,
        loadPermissionsForResource,
        loadAllSystemResources,
        loadHistoryEvents,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

