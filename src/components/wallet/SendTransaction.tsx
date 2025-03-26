
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/context/AuthContext';
import { transferCareCoins } from '@/lib/supabaseApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendTransaction, transferCareCoinsToken } from '@/lib/carecoin';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Placeholder for the deployed token contract address
const CARE_COIN_CONTRACT_ADDRESS = '0x123456789abcdef123456789abcdef123456789a';

const SendTransaction = () => {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { user, updateCurrentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState("platform");
  const [ethereumAddress, setEthereumAddress] = useState("");
  const { isWalletConnected, walletAddress, tokenBalance, refreshBalances } = useWallet();

  const handleSendPlatformCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (amount <= 0) {
      toast.error("Please enter an amount greater than 0.");
      return;
    }
    
    if (amount > (user.careCoinsBalance || 0)) {
      toast.error("Insufficient balance for this transaction.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await transferCareCoins(user.id, recipient, amount);
      
      // Update the user's local balance
      if (updateCurrentUser) {
        updateCurrentUser({
          careCoinsBalance: (user.careCoinsBalance || 0) - amount
        });
      }
      
      toast.success(`You have sent ${amount} CareCoins to ${recipientName}.`);
      
      // Reset form
      setRecipient("");
      setRecipientName("");
      setAmount(0);
      
      // Close modal
      setOpen(false);
      
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Failed to send CareCoins. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBlockchainCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (amount <= 0) {
      toast.error("Please enter an amount greater than 0.");
      return;
    }
    
    if (!ethereumAddress || !ethereumAddress.startsWith('0x')) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send token transaction
      const success = await transferCareCoinsToken(
        CARE_COIN_CONTRACT_ADDRESS,
        ethereumAddress,
        amount.toString()
      );

      if (success) {
        // Refresh balances after successful transaction
        await refreshBalances();
        
        // Reset form
        setEthereumAddress("");
        setAmount(0);
        
        // Close modal
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Blockchain transfer error:", error);
      toast.error(error.message || "Failed to send CareCoins. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Send CareCoins</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send CareCoins</DialogTitle>
          <DialogDescription>
            Send CareCoins on the platform or blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="platform" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platform">Platform Transfer</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Transfer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="platform">
            <form onSubmit={handleSendPlatformCoins}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recipient" className="text-right">
                    Recipient ID
                  </Label>
                  <Input
                    type="text"
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="col-span-3"
                    placeholder="Recipient User ID"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recipientName" className="text-right">
                    Recipient Name
                  </Label>
                  <Input
                    type="text"
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="col-span-3"
                    placeholder="Recipient Name"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="col-span-3"
                    placeholder="Amount"
                    required
                  />
                </div>
                <div className="p-1 border rounded flex items-center mb-4">
                  <span className="text-sm font-medium px-3">Balance: {user?.careCoinsBalance || 0} CC</span>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send CareCoins"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="blockchain">
            {!isWalletConnected ? (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your wallet first to send blockchain CareCoins.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSendBlockchainCoins}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ethereumAddress" className="text-right">
                      ETH Address
                    </Label>
                    <Input
                      type="text"
                      id="ethereumAddress"
                      value={ethereumAddress}
                      onChange={(e) => setEthereumAddress(e.target.value)}
                      className="col-span-3 font-mono"
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tokenAmount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      type="number"
                      id="tokenAmount"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="col-span-3"
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div className="p-1 border rounded flex items-center mb-4">
                    <span className="text-sm font-medium px-3">Token Balance: {tokenBalance} CARE</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send On Blockchain"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SendTransaction;
