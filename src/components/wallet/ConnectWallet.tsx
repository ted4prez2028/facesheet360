
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { connectMetaMask, getConnectedAccount, isMetaMaskInstalled, addAccountChangeListener } from "@/lib/carecoin";
import { useAuth } from "@/context/AuthContext";
import { updateWalletAddress } from "@/lib/supabaseApi";

export function ConnectWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUserProfile } = useAuth();
  
  useEffect(() => {
    const checkConnection = async () => {
      const account = await getConnectedAccount();
      setWalletAddress(account);
    };
    
    checkConnection();
    
    // Set up event listener for account changes
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      };
      
      addAccountChangeListener(handleAccountsChanged);
      
      // Cleanup
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const account = await connectMetaMask();
      setWalletAddress(account);
      
      // Save wallet address to user profile if logged in
      if (account && user) {
        await updateWalletAddress(user.id, account);
        // Update local user state with the wallet address
        updateUserProfile({ walletAddress: account });
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Crypto Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to send and receive CareCoins using cryptocurrency
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isMetaMaskInstalled() ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MetaMask not installed</AlertTitle>
            <AlertDescription>
              Please install MetaMask browser extension to use this feature.
              <div className="mt-4">
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download MetaMask
                </a>
              </div>
            </AlertDescription>
          </Alert>
        ) : walletAddress ? (
          <div>
            <p className="text-sm font-medium">Connected Wallet:</p>
            <p className="font-mono mt-1 text-sm break-all bg-muted p-3 rounded-md">
              {walletAddress}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              Connect your MetaMask wallet to manage your cryptocurrency
            </p>
          </>
        )}
      </CardContent>
      <CardFooter>
        {!walletAddress && isMetaMaskInstalled() && (
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
        )}
        {walletAddress && (
          <Button variant="outline" onClick={handleConnect} className="w-full">
            Reconnect Wallet
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
