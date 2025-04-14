
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Code, Loader2, Coins, Wallet } from "lucide-react";
import { isMetaMaskInstalled, getConnectedAccount, CARECOIN_REWARDS } from "@/lib/carecoin";
import { ethers } from "ethers";
import { toast } from "sonner";

// Simple ERC-20 token contract with reward distribution functionality
const TOKEN_CONTRACT_BYTECODE = `
// This would be the actual bytecode of your compiled contract
`;

// Enhanced ERC-20 ABI with reward distribution function
const TOKEN_CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function mintReward(address provider, address patient, address platform) returns (bool)"
];

export function TokenDeployer() {
  const [tokenName, setTokenName] = useState("CareCoin");
  const [tokenSymbol, setTokenSymbol] = useState("CARE");
  const [tokenSupply, setTokenSupply] = useState("1000000");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const deployToken = async () => {
    setError(null);
    setIsDeploying(true);
    
    try {
      if (!isMetaMaskInstalled()) {
        setError("MetaMask is not installed");
        return;
      }
      
      const address = await getConnectedAccount();
      if (!address) {
        setError("Please connect your wallet first");
        return;
      }
      
      // Basic validation
      if (!tokenName || !tokenSymbol || !tokenSupply) {
        setError("Please fill in all fields");
        return;
      }
      
      const supplyValue = parseFloat(tokenSupply);
      if (isNaN(supplyValue) || supplyValue <= 0) {
        setError("Supply must be a positive number");
        return;
      }
      
      // This is where we would deploy the actual contract
      // For the purpose of this demo, we'll simulate success
      
      // In a real implementation, you would:
      // 1. Get the contract factory
      // 2. Deploy the contract with the constructor arguments
      // 3. Wait for deployment
      // 4. Get the contract address
      
      // Simulating deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a deployed contract address
      const simulatedAddress = "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      setDeployedAddress(simulatedAddress);
      
      toast.success("CareCoin token contract deployed successfully!");
    } catch (err: any) {
      console.error("Error deploying token:", err);
      setError(err.message || "Failed to deploy token contract");
    } finally {
      setIsDeploying(false);
    }
  };
  
  const addTokenToMetaMask = async () => {
    if (!deployedAddress) return;
    
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: deployedAddress,
            symbol: tokenSymbol,
            decimals: 18,
            name: tokenName,
          },
        },
      });
      
      if (wasAdded) {
        toast.success("Token added to MetaMask!");
      } else {
        toast.info("Token was not added to MetaMask");
      }
    } catch (error) {
      console.error("Error adding token to MetaMask:", error);
      toast.error("Failed to add token to MetaMask");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-green-500" />
          Deploy CareCoin Token
        </CardTitle>
        <CardDescription>
          Create your own ERC-20 token for healthcare data rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isMetaMaskInstalled() ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MetaMask not installed</AlertTitle>
            <AlertDescription>
              Please install MetaMask browser extension to deploy tokens.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {deployedAddress ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Token Deployed Successfully!</AlertTitle>
                  <AlertDescription>
                    Your CareCoin token has been deployed to the blockchain.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Label className="block text-sm font-medium mb-1">Contract Address:</Label>
                  <div className="font-mono text-sm p-3 bg-muted rounded-md break-all">
                    {deployedAddress}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-sm">Name</Label>
                    <div className="font-medium">{tokenName}</div>
                  </div>
                  <div>
                    <Label className="text-sm">Symbol</Label>
                    <div className="font-medium">{tokenSymbol}</div>
                  </div>
                  <div>
                    <Label className="text-sm">Total Supply</Label>
                    <div className="font-medium">{tokenSupply} {tokenSymbol}</div>
                  </div>
                  <div>
                    <Label className="text-sm">Decimals</Label>
                    <div className="font-medium">18</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Reward Distribution</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Healthcare Provider:</span>
                      <span className="font-medium">{CARECOIN_REWARDS.PROVIDER_PERCENTAGE}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Patient:</span>
                      <span className="font-medium">{CARECOIN_REWARDS.PATIENT_PERCENTAGE}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Platform Owner:</span>
                      <span className="font-medium">{CARECOIN_REWARDS.PLATFORM_PERCENTAGE}%</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={addTokenToMetaMask}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Add Token to MetaMask
                </Button>
              </div>
            ) : (
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tokenName">Token Name</Label>
                    <Input
                      id="tokenName"
                      placeholder="CareCoin"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tokenSymbol">Token Symbol</Label>
                    <Input
                      id="tokenSymbol"
                      placeholder="CARE"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tokenSupply">Initial Supply</Label>
                    <Input
                      id="tokenSupply"
                      placeholder="1000000"
                      value={tokenSupply}
                      onChange={(e) => setTokenSupply(e.target.value)}
                      type="number"
                      min="1"
                    />
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                    <AlertTitle className="text-amber-800 dark:text-amber-300">Reward Distribution</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 text-sm space-y-1">
                        <li>Healthcare Provider: {CARECOIN_REWARDS.PROVIDER_PERCENTAGE}%</li>
                        <li>Patient: {CARECOIN_REWARDS.PATIENT_PERCENTAGE}%</li>
                        <li>Platform Owner: {CARECOIN_REWARDS.PLATFORM_PERCENTAGE}%</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </form>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!deployedAddress && (
          <Button
            type="button"
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={deployToken}
            disabled={isDeploying || !isMetaMaskInstalled()}
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Deploy Token Contract
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
