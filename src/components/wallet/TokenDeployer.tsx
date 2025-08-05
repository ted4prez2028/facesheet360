import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { storeContractAddress } from "@/lib/web3";
import { MetaMaskIntegration } from "./MetaMaskIntegration";

interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  network?: string;
  contractDetails?: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: string;
  };
  abi?: string[];
  error?: string;
  message?: string;
}

export function TokenDeployer() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const deployCareCoin = async () => {
    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      console.log('Calling deploy-carecoin function...');
      
      const { data, error } = await supabase.functions.invoke('deploy-carecoin', {
        body: {}
      });

      if (error) {
        throw new Error(error.message || 'Failed to deploy contract');
      }

      if (data.success) {
        setDeploymentResult(data);
        
        // Store the contract address and ABI locally
        if (data.contractAddress && data.abi) {
          storeContractAddress(data.contractAddress, data.abi);
        }
        
        toast.success(`CareCoin deployed successfully! Address: ${data.contractAddress}`);
      } else {
        throw new Error(data.error || 'Deployment failed');
      }

    } catch (error: unknown) {
      console.error('Deployment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
      setDeploymentResult({
        success: false,
        error: errorMessage
      });
      toast.error(`Deployment failed: ${errorMessage}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🪙 CareCoin Deployment
        </CardTitle>
        <CardDescription>
          Deploy the CareCoin ERC-20 token contract on Sepolia testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!deploymentResult && (
          <Button 
            onClick={deployCareCoin} 
            disabled={isDeploying}
            className="w-full"
            size="lg"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying CareCoin...
              </>
            ) : (
              'Deploy CareCoin on Sepolia'
            )}
          </Button>
        )}

        {deploymentResult && (
          <div className="space-y-4">
            {deploymentResult.success ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-semibold">{deploymentResult.message}</p>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Contract Address:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-white px-2 py-1 rounded text-xs break-all">
                            {deploymentResult.contractAddress}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://sepolia.etherscan.io/address/${deploymentResult.contractAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View on Etherscan
                            </a>
                          </Button>
                        </div>
                      </div>
                      
                      {deploymentResult.transactionHash && (
                        <div>
                          <span className="font-medium">Transaction Hash:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-white px-2 py-1 rounded text-xs break-all">
                              {deploymentResult.transactionHash}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://sepolia.etherscan.io/tx/${deploymentResult.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Transaction
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {deploymentResult.contractDetails && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Contract Details:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="font-medium">Name:</span> {deploymentResult.contractDetails.name}</div>
                          <div><span className="font-medium">Symbol:</span> {deploymentResult.contractDetails.symbol}</div>
                          <div><span className="font-medium">Decimals:</span> {deploymentResult.contractDetails.decimals}</div>
                          <div><span className="font-medium">Total Supply:</span> {deploymentResult.contractDetails.totalSupply} CARE</div>
                          <div className="col-span-2">
                            <span className="font-medium">Owner:</span> 
                            <code className="ml-1 text-xs">{deploymentResult.contractDetails.owner}</code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Deployment Failed</p>
                    <p className="text-sm">{deploymentResult.error}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setDeploymentResult(null);
                  setIsDeploying(false);
                }}
                variant="outline"
                className="w-full"
              >
                Deploy Another Contract
              </Button>

              {deploymentResult.success && deploymentResult.contractAddress && (
                <MetaMaskIntegration
                  contractAddress={deploymentResult.contractAddress}
                  tokenSymbol={deploymentResult.contractDetails?.symbol || "CARE"}
                  tokenDecimals={deploymentResult.contractDetails?.decimals || 18}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}