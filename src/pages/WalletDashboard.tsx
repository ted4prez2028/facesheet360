
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// CareCoin Dashboard Components
import { CareCoinsDashboard } from '@/components/wallet/CareCoinsDashboard';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { CoinsSummaryView } from '@/components/wallet/CoinsSummaryView';

// Wallet Management Components
import ConnectWallet from '@/components/wallet/ConnectWallet';
import SendTransaction from '@/components/wallet/SendTransaction';
import { CareCoinsRewards } from '@/components/wallet/CareCoinsRewards';

// CareCoin Token Components
import { TokenDeployer } from '@/components/wallet/TokenDeployer';
import CareCoinGuide from '@/components/wallet/CareCoinGuide';
import { MetaMaskIntegration } from '@/components/wallet/MetaMaskIntegration';
import { useGlobalCareCoin } from '@/hooks/useGlobalCareCoin';

const WalletDashboard = () => {
  const { existingContract, isDeployed } = useGlobalCareCoin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Dashboard</h1>
        <p className="text-muted-foreground">Manage your CareCoins, deploy tokens, and handle crypto transactions</p>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="token">CareCoin</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <WalletBalance />
              <div className="mt-6">
                <CoinsSummaryView />
              </div>
            </div>
            <div className="lg:col-span-2">
              <CareCoinsDashboard />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="wallet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConnectWallet />
            <WalletBalance />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SendTransaction />
            <CareCoinsRewards />
          </div>
        </TabsContent>
        
        <TabsContent value="token" className="space-y-6">
          <TokenDeployer />
          
          {isDeployed && existingContract && (
            <MetaMaskIntegration
              contractAddress={existingContract.contract_address}
              tokenSymbol={existingContract.contract_details.symbol}
              tokenDecimals={existingContract.contract_details.decimals}
            />
          )}
        </TabsContent>
        
        <TabsContent value="guide" className="space-y-6">
          <CareCoinGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletDashboard;
