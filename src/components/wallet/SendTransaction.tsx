
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { transferCareCoins } from "@/lib/supabaseApi";

const SendTransaction = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateCurrentUser } = useAuth();

  const sendTransaction = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send transactions",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Parse the amount as a number
      const amountToSend = parseInt(amount, 10);
      
      if (isNaN(amountToSend) || amountToSend <= 0) {
        throw new Error("Please enter a valid positive amount");
      }
      
      if (user.care_coins_balance && amountToSend > user.care_coins_balance) {
        throw new Error("Insufficient balance");
      }

      // Send the transaction
      await transferCareCoins(user.id, recipient, amountToSend);
      
      // Update local user state with new balance
      if (user.care_coins_balance) {
        updateCurrentUser({
          ...user,
          care_coins_balance: user.care_coins_balance - amountToSend
        });
      }
      
      toast({
        title: "Transaction successful",
        description: `You've sent ${amountToSend} CareCoins to ${recipient.substring(0, 8)}...`,
      });
      
      // Reset form
      setRecipient("");
      setAmount("");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Send CareCoins</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="recipient" className="text-sm font-medium">
            Recipient Address
          </label>
          <Input
            id="recipient"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="amount" className="text-sm font-medium">
            Amount
          </label>
          <Input
            id="amount"
            type="number"
            placeholder="Amount to send"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {user?.care_coins_balance !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              Available balance: {user.care_coins_balance} CareCoins
            </p>
          )}
        </div>
        <Button 
          className="w-full" 
          onClick={sendTransaction} 
          disabled={isLoading || !recipient || !amount}
        >
          {isLoading ? "Sending..." : "Send CareCoins"}
        </Button>
      </div>
    </div>
  );
};

export default SendTransaction;
