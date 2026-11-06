import React, { useState } from 'react';
import { useWeb3 } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { NetworkBanner } from './components/NetworkBanner';
import { Footer } from './components/Footer';
import { TxNotification } from './components/TxNotification';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { RegisterResourcePage } from './pages/RegisterResourcePage';
import { DashboardPage } from './pages/DashboardPage';
import { GrantAccessPage } from './pages/GrantAccessPage';
import { ManagePermissionsPage } from './pages/ManagePermissionsPage';
import { AccessCheckPage } from './pages/AccessCheckPage';
import { HistoryPage } from './pages/HistoryPage';

export const AppContent: React.FC = () => {
  const { chainId, switchToBotChain, txStatus, setTxStatus } = useWeb3();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(undefined);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState<boolean>(false);

  const handleNavigate = (tab: string, resourceId?: string) => {
    if (resourceId) {
      setSelectedResourceId(resourceId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      await switchToBotChain();
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080d1a] text-gray-100 selection:bg-cyan-500 selection:text-black">
      {/* Network Warning Banner if on wrong chain */}
      <NetworkBanner
        currentChainId={chainId}
        onSwitchNetwork={handleSwitchNetwork}
        isSwitching={isSwitchingNetwork}
      />

      {/* Main Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {activeTab === 'connect' && <ConnectWalletPage onNavigate={handleNavigate} />}
        {activeTab === 'register' && <RegisterResourcePage onNavigate={handleNavigate} />}
        {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {activeTab === 'grant' && (
          <GrantAccessPage
            initialResourceId={selectedResourceId}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'manage' && (
          <ManagePermissionsPage
            initialResourceId={selectedResourceId}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'check' && <AccessCheckPage />}
        {activeTab === 'history' && <HistoryPage />}
      </main>

      {/* Global Transaction Toast / Modal */}
      <TxNotification
        status={txStatus}
        onClose={() => setTxStatus({ state: 'idle' })}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppContent;

