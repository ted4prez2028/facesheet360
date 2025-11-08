import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getTokenBalance, getStoredContractAddress, switchToSepolia, isOnSepolia } from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";

export function MetaMaskBalance() {
  const { isWalletConnected, walletAddress } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const contractAddress = getStoredContractAddress();

  const checkNetwork = async () => {
    try {
      const onSepolia = await isOnSepolia();
      setIsCorrectNetwork(onSepolia);
      return onSepolia;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  const fetchBalance = async () => {
    if (!contractAddress || !walletAddress) {
      return;
    }

    setIsLoading(true);
    try {
      const onSepolia = await checkNetwork();
      if (!onSepolia) {
        toast.error('Please switch to Sepolia testnet in MetaMask');
        setIsLoading(false);
        return;
      }

      const tokenBalance = await getTokenBalance(contractAddress, walletAddress);
      setBalance(tokenBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance from MetaMask');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepolia();
      toast.success('Switched to Sepolia testnet');
      await checkNetwork();
      await fetchBalance();
    } catch (error) {
      console.error('Error switching network:', error);
      toast.error('Failed to switch network. Please switch manually in MetaMask.');
    }
  };

  useEffect(() => {
    if (isWalletConnected && contractAddress) {
      fetchBalance();
    }
  }, [isWalletConnected, contractAddress, walletAddress]);

  // Listen for network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = () => {
      checkNetwork();
      fetchBalance();
    };

    const ethereum = window.ethereum as any;
    ethereum.on?.('chainChanged', handleChainChanged);
    
    return () => {
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [contractAddress, walletAddress]);

  if (!isWalletConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Connect your MetaMask wallet to view your CareCoin balance
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!contractAddress) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              No CareCoin contract deployed yet. Deploy the contract first to see your balance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          MetaMask CareCoin Balance
        </CardTitle>
        <CardDescription>
          Your CareCoin balance from the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCorrectNetwork && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>Please switch to Sepolia testnet</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSwitchNetwork}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Your Wallet:</div>
          <div className="font-mono text-xs break-all bg-muted p-2 rounded">
            {walletAddress}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">CareCoin Balance:</div>
          <div className="text-3xl font-bold">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : balance !== null ? (
              <span>{parseFloat(balance).toFixed(2)} CARE</span>
            ) : (
              <span className="text-muted-foreground">--</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchBalance}
            disabled={isLoading || !isCorrectNetwork}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Balance
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <a
              href={`https://sepolia.etherscan.io/token/${contractAddress}?a=${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            This balance is fetched directly from the Sepolia blockchain via MetaMask.
            Any transactions or transfers you make will be reflected here after confirmation.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
