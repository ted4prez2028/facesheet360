
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { WalletIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isMetaMaskInstalled } from '@/lib/carecoin';

const ConnectWallet = () => {
  const { user } = useAuth();
  const { 
    isWalletConnected, 
    walletAddress, 
    ethBalance, 
    isLoading, 
    connectWallet 
  } = useWallet();

  if (!user) {
    return null;
  }

  const handleConnect = async () => {
    if (isWalletConnected) {
      toast.info('Wallet already connected');
      return;
    }
    
    await connectWallet();
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Connection</CardTitle>
        <WalletIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!isMetaMaskInstalled() ? (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              MetaMask is not installed. Please install the MetaMask browser extension to use CareCoins.
            </AlertDescription>
          </Alert>
        ) : isWalletConnected ? (
          <div className="space-y-2">
            <CardDescription className="text-xs">
              Connected Wallet
            </CardDescription>
            <div className="font-mono text-sm truncate">
              {formatAddress(walletAddress || '')}
            </div>
            {ethBalance && (
              <div className="text-sm">
                <span className="text-muted-foreground">Balance:</span> {ethBalance} ETH
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2">
              Disconnect
            </Button>
          </div>
        ) : (
          <>
            <CardDescription className="text-xs">
              Connect your wallet to receive 10 CareCoins and start using blockchain features.
            </CardDescription>
            <Button 
              disabled={isLoading} 
              onClick={handleConnect} 
              className="mt-4 w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectWallet;
