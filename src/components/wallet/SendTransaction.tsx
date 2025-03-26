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

const SendTransaction = () => {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()
  const { user, updateCurrentUser } = useAuth();

  const handleSendCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > user.careCoinsBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough CareCoins for this transaction.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await transferCareCoins(user.id, recipient, amount);
      
      // Update the user's local balance
      if (updateCurrentUser) {
        updateCurrentUser({
          careCoinsBalance: user.careCoinsBalance - amount
        });
      }
      
      toast({
        title: "Transaction successful",
        description: `You have sent ${amount} CareCoins to ${recipientName}.`,
      });
      
      // Reset form
      setRecipient("");
      setRecipientName("");
      setAmount(0);
      
      // Close modal
      setOpen(false);
      
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to send CareCoins. Please try again.",
        variant: "destructive",
      });
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
            Send CareCoins to another user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendCoins}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
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
      </DialogContent>
    </Dialog>
  );
};

export default SendTransaction;
