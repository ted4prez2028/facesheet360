
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, SendHorizontal, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isMetaMaskInstalled, sendTransaction, getConnectedAccount, getBalance } from "@/lib/carecoin";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SendTransaction() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [gasPriceLoading, setGasPriceLoading] = useState(false);
  
  // Get the wallet balance and gas price when component mounts
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const account = await getConnectedAccount();
        setConnectedAccount(account);
        
        if (account) {
          const balance = await getBalance(account);
          setWalletBalance(balance);
        }
        
        // Fetch current gas price
        fetchGasPrice();
      } catch (error) {
        console.error("Error fetching wallet info:", error);
      }
    };
    
    fetchWalletInfo();
    
    // Set up listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setConnectedAccount(accounts[0] || null);
        if (accounts[0]) {
          getBalance(accounts[0]).then(balance => setWalletBalance(balance));
        } else {
          setWalletBalance("0");
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);
  
  const fetchGasPrice = async () => {
    setGasPriceLoading(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const gasPrice = await provider.getGasPrice();
        const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, "gwei");
        setGasPrice(parseFloat(gasPriceInGwei).toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching gas price:", error);
    } finally {
      setGasPriceLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!recipient || !amount) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setError("Invalid recipient address");
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Amount must be a positive number");
      return;
    }
    
    // Check if wallet is connected
    const account = await getConnectedAccount();
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }
    
    // Check if there's enough balance
    const currentBalance = parseFloat(walletBalance);
    if (amountValue > currentBalance) {
      setError(`Insufficient balance. You have ${walletBalance} ETH`);
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const success = await sendTransaction(recipient, amount);
      
      if (success) {
        // Reset form on success
        setRecipient("");
        setAmount("");
        
        // Update balance after successful transaction
        const newBalance = await getBalance(account);
        setWalletBalance(newBalance);
      }
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetMaxAmount = () => {
    // Set the amount to the wallet balance minus a small amount for gas
    const maxAmount = Math.max(0, parseFloat(walletBalance) - 0.01);
    setAmount(maxAmount.toFixed(4));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SendHorizontal className="h-5 w-5" />
          Send Crypto
        </CardTitle>
        <CardDescription>
          Send cryptocurrency to another wallet address
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isMetaMaskInstalled() ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MetaMask not installed</AlertTitle>
            <AlertDescription>
              Please install MetaMask browser extension to use this feature.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="send">Send</TabsTrigger>
              <TabsTrigger value="info">Network Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send">
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      {connectedAccount && (
                        <div className="text-xs text-muted-foreground">
                          Available: {walletBalance} {gasPrice ? `(Gas: ~${gasPrice} Gwei)` : ''}
                        </div>
                      )}
                    </div>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="amount" className="flex items-center gap-1">
                      Amount
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Enter the amount to send. Make sure to leave enough for gas fees.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <div className="flex items-center gap-2 mr-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={handleSetMaxAmount}
                            disabled={!connectedAccount || parseFloat(walletBalance) <= 0}
                          >
                            MAX
                          </Button>
                          <div className="text-muted-foreground pr-2">
                            ETH
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={!isMetaMaskInstalled() || isSubmitting || !connectedAccount}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Transaction"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Current Gas Price</Label>
                  <div className="flex items-center mt-1">
                    {gasPriceLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <div className="text-xl font-semibold">
                        {gasPrice ? `${gasPrice} Gwei` : "Unknown"}
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchGasPrice}
                      className="ml-2"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Connected Account</Label>
                  <div className="font-mono text-sm mt-1 bg-muted p-2 rounded-md break-all">
                    {connectedAccount || "Not connected"}
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Transaction Tips</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Always double-check the recipient address</li>
                      <li>Higher gas prices can result in faster transactions</li>
                      <li>Transactions cannot be reversed once confirmed</li>
                      <li>Keep enough ETH for gas fees</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        {isMetaMaskInstalled() && (
          <div className="w-full text-xs text-muted-foreground">
            <p>Transactions may take a few moments to be confirmed on the blockchain.</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
