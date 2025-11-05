/**
 * Real CareCoin Operations - Mint, Send, Receive, Stake
 * Uses real Ethereum smart contract integration
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Coins, Send, Download, Banknote, TrendingUp, Wallet } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useGlobalCareCoin } from '@/hooks/useGlobalCareCoin';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CareCoinOperations = () => {
  const { walletAddress, isWalletConnected, connectWallet } = useWallet();
  const { existingContract, isDeployed } = useGlobalCareCoin();
  
  const [mintAmount, setMintAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMint = async () => {
    if (!mintAmount || !mintTo) {
      toast.error('Please provide both amount and recipient address');
      return;
    }

    if (!existingContract?.contract_address) {
      toast.error('CareCoin not deployed yet');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('mint-carecoin', {
        body: {
          contractAddress: existingContract.contract_address,
          toAddress: mintTo,
          amount: mintAmount,
        }
      });

      if (error) throw error;

      toast.success(`Successfully minted ${mintAmount} CARE tokens`);
      setMintAmount('');
      setMintTo('');
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint tokens');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !sendTo) {
      toast.error('Please provide both amount and recipient address');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!existingContract?.contract_address) {
      toast.error('CareCoin not deployed yet');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('transfer-carecoin', {
        body: {
          contractAddress: existingContract.contract_address,
          recipientAddress: sendTo,
          amount: sendAmount,
        }
      });

      if (error) throw error;

      toast.success(`Successfully sent ${sendAmount} CARE tokens`);
      setSendAmount('');
      setSendTo('');
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send tokens');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) {
      toast.error('Please provide stake amount');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!existingContract?.contract_address) {
      toast.error('CareCoin not deployed yet');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('stake-carecoin', {
        body: {
          contractAddress: existingContract.contract_address,
          amount: stakeAmount,
        }
      });

      if (error) throw error;

      toast.success(`Successfully staked ${stakeAmount} CARE tokens (7% APY)`);
      setStakeAmount('');
    } catch (error) {
      console.error('Stake error:', error);
      toast.error('Failed to stake tokens');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isDeployed) {
    return (
      <Alert>
        <AlertDescription>
          CareCoin has not been deployed yet. Please deploy the token first from the Wallet Dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>CareCoin Operations</CardTitle>
                <CardDescription>Manage your healthcare cryptocurrency</CardDescription>
              </div>
            </div>
            {isWalletConnected && (
              <Badge variant="default" className="flex items-center gap-2">
                <Wallet className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isWalletConnected ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Connect your wallet to perform operations</p>
              <Button onClick={connectWallet}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="send">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </TabsTrigger>
                <TabsTrigger value="mint">
                  <Coins className="h-4 w-4 mr-2" />
                  Mint
                </TabsTrigger>
                <TabsTrigger value="stake">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Stake
                </TabsTrigger>
              </TabsList>

              <TabsContent value="send" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sendTo">Recipient Address</Label>
                  <Input
                    id="sendTo"
                    placeholder="0x..."
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendAmount">Amount (CARE)</Label>
                  <Input
                    id="sendAmount"
                    type="number"
                    placeholder="100"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSend} 
                  disabled={isProcessing} 
                  className="w-full"
                >
                  {isProcessing ? 'Sending...' : 'Send CARE Tokens'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Send CARE tokens to healthcare providers, patients, or other addresses. Transaction will be recorded on Ethereum blockchain.
                </p>
              </TabsContent>

              <TabsContent value="mint" className="space-y-4">
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Minting Policy:</strong> Only authorized healthcare providers can mint tokens as rewards for quality care delivery. 60% to provider, 30% to patient, 10% to platform.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="mintTo">Recipient Address</Label>
                  <Input
                    id="mintTo"
                    placeholder="0x..."
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mintAmount">Amount (CARE)</Label>
                  <Input
                    id="mintAmount"
                    type="number"
                    placeholder="100"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleMint} 
                  disabled={isProcessing} 
                  className="w-full"
                >
                  {isProcessing ? 'Minting...' : 'Mint CARE Tokens'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Mint new CARE tokens as rewards for healthcare services. Requires provider authorization.
                </p>
              </TabsContent>

              <TabsContent value="stake" className="space-y-4">
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Staking Rewards:</strong> Earn 7% annual percentage yield (APY) by staking your CARE tokens. Funds are locked for 30 days minimum.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="stakeAmount">Amount to Stake (CARE)</Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    placeholder="1000"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Staking Amount:</span>
                    <span className="font-medium">{stakeAmount || '0'} CARE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>APY:</span>
                    <span className="font-medium text-green-600">7.0%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual Rewards:</span>
                    <span className="font-medium">{(Number(stakeAmount) * 0.07).toFixed(2)} CARE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lock Period:</span>
                    <span className="font-medium">30 days</span>
                  </div>
                </div>
                <Button 
                  onClick={handleStake} 
                  disabled={isProcessing} 
                  className="w-full"
                >
                  {isProcessing ? 'Staking...' : 'Stake CARE Tokens'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Stake your tokens to earn passive income while supporting the healthcare ecosystem.
                </p>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Economic Model</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p><strong>Token Supply:</strong> 1,000,000,000 CARE (1 billion tokens)</p>
          <p><strong>Value Backing:</strong> Healthcare services, quality outcomes, and platform utility</p>
          <p><strong>Distribution:</strong> 60% providers, 30% patients, 10% platform/development</p>
          <p><strong>Deflation:</strong> 1% of transaction fees burned to reduce supply over time</p>
          <p><strong>Utility:</strong> Payment for services, rewards, staking, governance voting</p>
          <p><strong>Network:</strong> Ethereum Mainnet (Layer 2 scaling for lower fees)</p>
        </CardContent>
      </Card>
    </div>
  );
};
