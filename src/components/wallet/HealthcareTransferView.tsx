
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HealthcareTransferView: React.FC = () => {
  const { user } = useAuth();
  const [recipientType, setRecipientType] = useState<string>('');
  const [recipientId, setRecipientId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipientId || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const transferAmount = parseInt(amount);
    if (transferAmount <= 0) {
      toast.error('Transfer amount must be positive');
      return;
    }

    if (transferAmount > (user.care_coins_balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      // Create the transaction
      const { error } = await supabase
        .from('care_coins_transactions')
        .insert({
          from_user_id: user.id,
          to_user_id: recipientId,
          amount: transferAmount,
          transaction_type: 'transfer',
          description: description || 'Healthcare transfer'
        });

      if (error) throw error;

      toast.success('Transfer completed successfully');
      
      // Reset form
      setRecipientId('');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Healthcare Transfer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientType">Recipient Type</Label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="facility">Healthcare Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient ID</Label>
            <Input
              id="recipientId"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Enter recipient ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (CareCoins)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transfer description"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processing...' : 'Send Transfer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthcareTransferView;
