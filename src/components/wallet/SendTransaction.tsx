
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, SendHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isMetaMaskInstalled, sendTransaction, getConnectedAccount } from "@/lib/carecoin";

export function SendTransaction() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await sendTransaction(recipient, amount);
      
      // Reset form on success
      setRecipient("");
      setAmount("");
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
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
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    ETH
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!isMetaMaskInstalled() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Sending..." : "Send Transaction"}
        </Button>
      </CardFooter>
    </Card>
  );
}
