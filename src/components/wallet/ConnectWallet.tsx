
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useWalletSetup } from "@/hooks/useWalletSetup";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ConnectWallet = () => {
  const { isWalletConnected, walletAddress, connectWallet } = useWallet();
  const { setupWallet, isProcessing } = useWalletSetup();
  const [showHelp, setShowHelp] = useState(false);
  
  const handleConnect = async () => {
    if (isWalletConnected) return;
    
    // First try the regular connect
    const success = await connectWallet();
    
    // If successful, also setup the welcome bonus
    if (success) {
      await setupWallet();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to manage your CareCoins
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isWalletConnected ? (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Connected Wallet</p>
            <p className="font-mono text-xs break-all">{walletAddress}</p>
          </div>
        ) : (
          <>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-sm">
                Connect your MetaMask wallet to manage your CareCoins and receive your
                welcome bonus of 1 CareCoin.
              </p>
            </div>
            
            {showHelp && (
              <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Don't have MetaMask?</p>
                  <p className="mb-2">
                    MetaMask is a digital wallet that allows you to interact with
                    blockchain applications. You'll need it to use CareCoins.
                  </p>
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Install MetaMask <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}
            
            {!window.ethereum && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  MetaMask is not installed. You'll need to install it to use CareCoins.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isWalletConnected ? (
          <Button disabled className="w-full" variant="outline">
            Wallet Connected
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              onClick={handleConnect} 
              className="flex-1"
              disabled={isProcessing || !window.ethereum}
            >
              {isProcessing ? "Connecting..." : "Connect MetaMask"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowHelp(!showHelp)}
              className="sm:w-auto"
            >
              {showHelp ? "Hide Help" : "Need Help?"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConnectWallet;
