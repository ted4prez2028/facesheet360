
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

const PlatformTransferForm = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch users for recipient selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user?.id); // Exclude current user
      
      if (error) throw error;
      return data as User[];
    },
    enabled: !!user?.id
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !recipient || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseInt(amount);
    if (transferAmount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    // Check if user has sufficient balance
    const userBalance = user.care_coins_balance || 0;
    if (transferAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${userBalance} Care Coins available`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('care_coins_transactions')
        .insert({
          from_user_id: user.id,
          to_user_id: recipient,
          amount: transferAmount,
          transaction_type: 'transfer',
          description: description || `Transfer to ${users.find(u => u.id === recipient)?.name || 'Unknown User'}`
        });

      if (transactionError) throw transactionError;

      // Update sender balance
      const { error: senderError } = await supabase
        .from('users')
        .update({ 
          care_coins_balance: userBalance - transferAmount 
        })
        .eq('id', user.id);

      if (senderError) throw senderError;

      // Update recipient balance
      const recipientUser = users.find(u => u.id === recipient);
      const recipientBalance = recipientUser?.care_coins_balance || 0;
      
      const { error: recipientError } = await supabase
        .from('users')
        .update({ 
          care_coins_balance: recipientBalance + transferAmount 
        })
        .eq('id', recipient);

      if (recipientError) throw recipientError;

      toast({
        title: "Transfer Successful",
        description: `Successfully transferred ${transferAmount} Care Coins`
      });

      // Reset form
      setAmount('');
      setRecipient('');
      setDescription('');
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "An error occurred while processing the transfer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userBalance = user?.care_coins_balance || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Care Coins</CardTitle>
        <p className="text-sm text-muted-foreground">
          Available Balance: {userBalance} Care Coins
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email} ({user.role || 'Doctor'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Care Coins)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={userBalance}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note for this transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !recipient || !amount}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Send Transfer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlatformTransferForm;
