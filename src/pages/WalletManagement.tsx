import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Wallet, ExternalLink, Copy, Check, AlertCircle, Coins } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getProvider } from '@/lib/web3';
import { useGlobalCareCoin } from '@/hooks/useGlobalCareCoin';
import { supabase } from '@/integrations/supabase/client';

export default function WalletManagement() {
  const { user, updateProfile } = useAuth();
  const { existingContract, isLoading: isContractLoading } = useGlobalCareCoin();
  const [walletAddress, setWalletAddress] = useState(user?.wallet_address || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintAmount, setMintAmount] = useState('100');

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
            disabled={isUpdating || !walletAddress || walletAddress === (user as any)?.wallet_address}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Wallet Address'}
          </Button>
        </CardContent>
      </Card>

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
