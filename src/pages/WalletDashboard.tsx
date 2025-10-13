
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CareCoinsDashboard } from '@/components/wallet/CareCoinsDashboard';

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">CareCoin Wallet</h1>
        <p className="text-muted-foreground">Manage your CareCoins and transactions</p>
      </div>
      
      <CareCoinsDashboard />
    </div>
  );
};

export default WalletDashboard;
