import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { useGlobalCareCoin } from "@/hooks/useGlobalCareCoin";
import { MetaMaskIntegration } from "./MetaMaskIntegration";
import { useWallet } from "@/hooks/useWallet";

export function TokenDeployer() {
  const { existingContract, isLoading, deployCareCoin, isDeployed } = useGlobalCareCoin();
  const { isWalletConnected, walletAddress, connectWallet } = useWallet();

  const handleDeploy = async () => {
    if (isDeployed) return;

    if (!walletAddress) {
      await connectWallet();
    }

    const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
    const address = accounts?.[0];

    if (!address) {
      toast.error('Wallet connection required');
      return;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x1') {
      toast.error('Please switch to Ethereum mainnet in MetaMask');
      return;
    }

    deployCareCoin.mutate(address);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Checking CareCoin status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🪙 CareCoin {isDeployed ? 'Contract' : 'Deployment'}
        </CardTitle>
        <CardDescription>
          {isDeployed
            ? "CareCoin is live on Ethereum mainnet - available for all users"
            : "Launch the CareCoin ERC-20 token contract on Ethereum mainnet"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDeployed && existingContract ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-3">
                <p className="font-semibold">CareCoin is deployed and ready to use!</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Contract Address:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-white px-2 py-1 rounded text-xs break-all flex-1">
                        {existingContract.contract_address}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(existingContract.contract_address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://etherscan.io/address/${existingContract.contract_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Etherscan
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Token Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-medium">Name:</span> {existingContract.contract_details.name}</div>
                      <div><span className="font-medium">Symbol:</span> {existingContract.contract_details.symbol}</div>
                      <div><span className="font-medium">Network:</span> Ethereum Mainnet</div>
                      <div><span className="font-medium">Total Supply:</span> {existingContract.contract_details.totalSupply} CARE</div>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {isWalletConnected ? (
              <div className="text-sm">
                Deploying as <code className="break-all">{walletAddress}</code>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You'll be prompted to connect your wallet before deployment.
              </p>
            )}

            <Button
              onClick={handleDeploy}
              disabled={isDeployed || deployCareCoin.isPending}
              className="w-full"
              size="lg"
            >
              {deployCareCoin.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying CareCoin...
                </>
              ) : (
                'Launch CareCoin on Mainnet'
              )}
            </Button>
          </div>
        )}
        {isDeployed && existingContract && (
          <MetaMaskIntegration
            contractAddress={existingContract.contract_address}
            tokenSymbol={existingContract.contract_details.symbol}
            tokenDecimals={existingContract.contract_details.decimals}
          />
        )}
      </CardContent>
    </Card>
  );
}