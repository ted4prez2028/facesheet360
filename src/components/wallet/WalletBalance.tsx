
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getConnectedAccount, getBalance } from "@/lib/carecoin";
import { useAuth } from "@/context/AuthContext";
import { getCareCoinsBalance } from "@/lib/supabaseApi";
import { Coins } from "lucide-react";

export function WalletBalance() {
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [careCoinsBalance, setCareCoinsBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoading(true);
      
      // Get connected wallet address
      const address = await getConnectedAccount();
      
      if (address) {
        // Get native token balance (ETH, MATIC, etc)
        const balance = await getBalance(address);
        setNativeBalance(balance);
      }
      
      // Get CareCoins balance from Supabase if logged in
      if (user) {
        const ccBalance = await getCareCoinsBalance(user.id);
        setCareCoinsBalance(ccBalance);
      }
      
      setIsLoading(false);
    };
    
    fetchBalances();
    
    // Set up interval to refresh balances
    const intervalId = setInterval(fetchBalances, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Wallet Balance
        </CardTitle>
        <CardDescription>
          Your cryptocurrency and CareCoins balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Native Token:</p>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : nativeBalance !== null ? (
              <p className="text-2xl font-bold">{nativeBalance} ETH</p>
            ) : (
              <p className="text-sm text-muted-foreground">Connect wallet to view balance</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">CareCoins:</p>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : careCoinsBalance !== null ? (
              <p className="text-2xl font-bold">{careCoinsBalance}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Login to view CareCoins balance</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
