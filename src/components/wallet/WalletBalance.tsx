
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getConnectedAccount, getBalance } from "@/lib/carecoin";
import { useAuth } from "@/context/AuthContext";
import { getCareCoinsBalance } from "@/lib/supabaseApi";
import { Coins, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function WalletBalance() {
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [careCoinsBalance, setCareCoinsBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [network, setNetwork] = useState<string>("Unknown Network");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  
  const detectNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        switch (chainId) {
          case '0x1':
            setNetwork('Ethereum Mainnet');
            break;
          case '0x5':
            setNetwork('Goerli Testnet');
            break;
          case '0xaa36a7':
            setNetwork('Sepolia Testnet');
            break;
          case '0x89':
            setNetwork('Polygon Mainnet');
            break;
          case '0x13881':
            setNetwork('Mumbai Testnet');
            break;
          default:
            setNetwork(`Chain ID: ${chainId}`);
        }
      } catch (error) {
        console.error("Error detecting network:", error);
        setNetwork("Unknown Network");
      }
    }
  };
  
  const fetchBalances = async () => {
    setIsLoading(true);
    
    try {
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
      
      // Detect current network
      await detectNetwork();
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast.error("Failed to fetch wallet balances");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBalances();
    
    // Set up interval to refresh balances
    const intervalId = setInterval(fetchBalances, 30000); // Every 30 seconds
    
    // Set up network change listener
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        detectNetwork();
        fetchBalances();
      });
    }
    
    return () => {
      clearInterval(intervalId);
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', detectNetwork);
      }
    };
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalances();
    setIsRefreshing(false);
    toast.success("Balances refreshed");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>
          Your cryptocurrency and CareCoins balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Current Network:</p>
              <Badge variant="outline" className="font-mono text-xs">
                {isLoading ? "Loading..." : network}
              </Badge>
            </div>
            
            <div className="border border-dashed rounded-md p-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Native Token:</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : nativeBalance !== null ? (
                  <p className="text-2xl font-bold">{nativeBalance} {network.includes('Polygon') ? 'MATIC' : 'ETH'}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Connect wallet to view balance</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">CareCoins:</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : careCoinsBalance !== null ? (
                  <p className="text-2xl font-bold">{careCoinsBalance} CARE</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Login to view CareCoins balance</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>CareCoins can be exchanged for services or transferred to other users.</p>
            <p className="mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
