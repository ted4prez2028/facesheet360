import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";
import { addTokenToMetaMask, getStoredContractAddress } from "@/lib/web3";

interface MetaMaskIntegrationProps {
  contractAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function MetaMaskIntegration({ 
  contractAddress, 
  tokenSymbol = "CARE", 
  tokenDecimals = 18 
}: MetaMaskIntegrationProps) {
  const [isAdding, setIsAdding] = useState(false);
  const storedAddress = getStoredContractAddress();
  const finalAddress = contractAddress || storedAddress;

  const handleAddToMetaMask = async () => {
    if (!finalAddress) {
      toast.error('No contract address available');
      return;
    }

    setIsAdding(true);
    try {
      const wasAdded = await addTokenToMetaMask(finalAddress, tokenSymbol, tokenDecimals);
      if (wasAdded) {
        toast.success('CareCoin token added to MetaMask successfully!');
      } else {
        toast.info('Token addition was cancelled');
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      toast.error('Failed to add token to MetaMask. Make sure MetaMask is installed and connected.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCopyAddress = () => {
    if (finalAddress) {
      navigator.clipboard.writeText(finalAddress);
      toast.success('Contract address copied to clipboard');
    }
  };

  if (!finalAddress) {
    return (
      <Alert>
        <AlertDescription>
          No CareCoin contract deployed yet. Deploy a contract first to enable MetaMask integration.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          MetaMask Integration
        </CardTitle>
        <CardDescription>
          Add CareCoin token to your MetaMask wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Contract Address:</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
              {finalAddress}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`https://etherscan.io/address/${finalAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Token Symbol:</span>
            <div className="text-muted-foreground">{tokenSymbol}</div>
          </div>
          <div>
            <span className="font-medium">Decimals:</span>
            <div className="text-muted-foreground">{tokenDecimals}</div>
          </div>
        </div>

        <Button 
          onClick={handleAddToMetaMask}
          disabled={isAdding}
          className="w-full"
        >
          {isAdding ? 'Adding to MetaMask...' : 'Add CareCoin to MetaMask'}
        </Button>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Make sure you're connected to Ethereum mainnet in MetaMask</li>
              <li>Click "Add CareCoin to MetaMask" button above</li>
              <li>Approve the token addition in MetaMask</li>
              <li>The CARE token will appear in your MetaMask wallet</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}