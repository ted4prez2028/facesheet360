import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ConnectWallet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateCurrentUser } = useAuth();

  const handleConnect = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Simulate connecting a wallet and receiving a bonus
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add 10 CareCoins to the user's balance
      const newBalance = (user.careCoinsBalance || 0) + 10;
      
      // Update the user's balance in the database (replace with your actual API call)
      // await updateCareCoinsBalance(user.id, newBalance);
      
      // Update the user's local state
      updateCurrentUser && updateCurrentUser({ careCoinsBalance: newBalance });
      
      toast.success('Wallet connected and bonus CareCoins received!');
      
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">
          Connect your wallet to receive 10 CareCoins.
        </CardDescription>
        <Button disabled={isLoading} onClick={handleConnect} className="mt-4 w-full">
          {isLoading ? 'Connecting...' : 'Connect'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectWallet;
