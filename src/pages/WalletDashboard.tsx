
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CareCoinsDashboard } from '@/components/wallet/CareCoinsDashboard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WalletDashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p className="mb-4 text-muted-foreground">You need to log in to access the CareCoin Wallet Dashboard.</p>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">CareCoin Wallet Dashboard</h1>
          <p className="text-muted-foreground">Manage your CareCoins, pay bills, and track achievements</p>
        </div>
        
        <CareCoinsDashboard />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">CareCoin Staking</h2>
          <StakingForm tokenBalance={tokenBalance} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletDashboard;
