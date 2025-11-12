import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Wallet, ExternalLink, Copy, Check, AlertCircle, Coins, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getProvider } from '@/lib/web3';
import { useGlobalCareCoin } from '@/hooks/useGlobalCareCoin';
import { supabase } from '@/integrations/supabase/client';
import { ethers } from 'ethers';

// Extend window type for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export default function WalletManagement() {
  const { user, updateProfile } = useAuth();
  const { existingContract, isLoading: isContractLoading, deployCareCoin, isDeployed } = useGlobalCareCoin();
  const [walletAddress, setWalletAddress] = useState(user?.wallet_address || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintAmount, setMintAmount] = useState('100');
  const [blockchainBalance, setBlockchainBalance] = useState<string | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    try {
      const provider = getProvider();
      if (!provider) {
        toast.error('MetaMask not detected. Please install MetaMask extension.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      toast.success('MetaMask wallet connected!');
    } catch (error) {
      console.error('MetaMask connection error:', error);
      toast.error('Failed to connect MetaMask wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!user?.id) return;

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      toast.error('Invalid Ethereum wallet address format');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ wallet_address: walletAddress });
      toast.success('Wallet address updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update wallet address');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenEtherscan = () => {
    if (user?.wallet_address) {
      window.open(`https://etherscan.io/address/${user.wallet_address}`, '_blank');
    }
  };

  const handleMintTokens = async () => {
    if (!user?.wallet_address) {
      toast.error('Please connect a wallet address first');
      return;
    }

    if (!existingContract?.contract_address) {
      toast.error('CareCoin contract not deployed. Please deploy the contract first.');
      return;
    }

    setIsMinting(true);
    try {
      const { data, error } = await supabase.functions.invoke('mint-carecoin', {
        body: {
          contractAddress: existingContract.contract_address,
          toAddress: user.wallet_address,
          amount: mintAmount
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully minted ${mintAmount} CARE tokens!`);
        toast.success(`Transaction hash: ${data.transactionHash}`);
        // Refresh balance after minting
        setTimeout(() => handleCheckBalance(), 3000);
      } else {
        throw new Error(data.error || 'Minting failed');
      }
    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error(error.message || 'Failed to mint tokens');
    } finally {
      setIsMinting(false);
    }
  };

  const handleDeployContract = async () => {
    if (!user?.wallet_address) {
      toast.error('Please connect a wallet address first');
      return;
    }

    try {
      await deployCareCoin.mutateAsync({
        deployerAddress: user.wallet_address,
        isTestnet: true
      });
    } catch (error: any) {
      console.error('Deployment error:', error);
      // Error toast is already shown by the mutation
    }
  };

  const handleCheckBalance = async () => {
    if (!user?.wallet_address) {
      toast.error('Please connect a wallet address first');
      return;
    }

    if (!existingContract?.contract_address) {
      toast.error('CareCoin contract not deployed yet');
      return;
    }

    setIsCheckingBalance(true);
    try {
      const CARECOIN_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      // Connect to Polygon Mumbai testnet - use working RPC
      const rpcUrl = existingContract.network === 'polygon-testnet' 
        ? 'https://rpc.ankr.com/polygon_mumbai'
        : 'https://polygon-rpc.com';
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        existingContract.contract_address,
        CARECOIN_ABI,
        provider
      );

      const balance = await contract.balanceOf(user.wallet_address);
      const decimals = await contract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      setBlockchainBalance(formattedBalance);
      toast.success(`Balance: ${formattedBalance} CARE tokens`);
    } catch (error: any) {
      console.error('Balance check error:', error);
      toast.error('Failed to check blockchain balance');
      setBlockchainBalance(null);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Auto-check balance when contract exists
  useEffect(() => {
    if (existingContract?.contract_address && user?.wallet_address) {
      handleCheckBalance();
    }
  }, [existingContract?.contract_address, user?.wallet_address]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to manage your wallet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
        <p className="text-muted-foreground">Manage your MetaMask wallet address for receiving CareCoins</p>
      </div>

      {/* Current Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Current Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.wallet_address ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Active
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopyAddress} variant="outline" className="flex-1">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
                <Button onClick={handleOpenEtherscan} variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All CareCoins earned will be minted and sent directly to this MetaMask wallet address on the Ethereum blockchain.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No wallet address configured. Connect your MetaMask wallet or manually enter an Ethereum address to receive CareCoins.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Connect or Update Wallet */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.wallet_address ? 'Update Wallet Address' : 'Connect Wallet'}
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet or manually enter an Ethereum address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleConnectMetaMask} 
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            <Wallet className="h-5 w-5 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or manually enter address</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-address">Ethereum Wallet Address</Label>
            <Input
              id="wallet-address"
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Enter a valid Ethereum address (starts with 0x followed by 40 hexadecimal characters)
            </p>
          </div>

          <Button 
            onClick={handleUpdateWallet} 
            disabled={isUpdating || !walletAddress || walletAddress === user?.wallet_address}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Wallet Address'}
          </Button>
        </CardContent>
      </Card>

      {/* Admin Mint Tokens */}
      {user?.email === 'tdicusmurray@gmail.com' && user?.wallet_address && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Admin: CareCoin Management
            </CardTitle>
            <CardDescription>
              Deploy contract, mint tokens, and check blockchain balance (Admin only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!existingContract ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Contract Not Deployed</AlertTitle>
                  <AlertDescription>
                    Deploy the CareCoin contract to Polygon Mumbai testnet to start minting tokens.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleDeployContract}
                  disabled={deployCareCoin.isPending}
                  className="w-full"
                  size="lg"
                >
                  {deployCareCoin.isPending ? 'Deploying to Testnet...' : 'Deploy CareCoin to Mumbai Testnet'}
                </Button>
              </>
            ) : (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium">Contract Address:</p>
                        <p className="text-xs font-mono break-all">{existingContract.contract_address}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Network: {existingContract.network}</p>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                          Deployed
                        </Badge>
                      </div>
                      {blockchainBalance !== null && (
                        <div className="pt-2 border-t">
                          <p className="font-medium">Blockchain Balance:</p>
                          <p className="text-2xl font-bold text-primary">{blockchainBalance} CARE</p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleCheckBalance}
                  disabled={isCheckingBalance}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingBalance ? 'animate-spin' : ''}`} />
                  {isCheckingBalance ? 'Checking Balance...' : 'Check Blockchain Balance'}
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      if (!existingContract?.contract_address) {
                        toast.error("CareCoin contract not deployed");
                        return;
                      }

                      if (!window.ethereum) {
                        toast.error("MetaMask not installed");
                        return;
                      }

                      const wasAdded = await window.ethereum.request({
                        method: 'wallet_watchAsset',
                        params: {
                          type: 'ERC20',
                          options: {
                            address: existingContract.contract_address,
                            symbol: 'CARE',
                            decimals: 18,
                            image: 'https://kxngtgrfdqhfpsqyhcui.supabase.co/storage/v1/object/public/patient-avatars/carecoin-logo.png',
                          },
                        },
                      });

                      if (wasAdded) {
                        toast.success("CARE token added to MetaMask!");
                      } else {
                        toast.info("Token addition cancelled");
                      }
                    } catch (error: any) {
                      console.error("Error adding token to MetaMask:", error);
                      toast.error(error.message || "Failed to add token to MetaMask");
                    }
                  }}
                  disabled={!existingContract}
                  variant="outline"
                  className="w-full"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Add CARE to MetaMask
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="mint-amount">Amount to Mint</Label>
                  <Input
                    id="mint-amount"
                    type="number"
                    placeholder="100"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of CARE tokens to mint to your wallet
                  </p>
                </div>

                <Button 
                  onClick={handleMintTokens}
                  disabled={isMinting || !mintAmount || parseInt(mintAmount) <= 0}
                  className="w-full"
                  size="lg"
                >
                  {isMinting ? 'Minting...' : `Mint ${mintAmount} CARE Tokens`}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How CareCoins Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Earn CareCoins</h3>
              <p className="text-sm text-muted-foreground">
                Earn CareCoins by charting patient data (vitals, medications, notes). 100 CC per entry.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Automatic Minting</h3>
              <p className="text-sm text-muted-foreground">
                CareCoins are automatically minted as ERC-20 tokens on Ethereum and sent to your wallet.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Distribution Split</h3>
              <p className="text-sm text-muted-foreground">
                40% to patient, 50% to provider, 10% founder fee to admin wallet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
