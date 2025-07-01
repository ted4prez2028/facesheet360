
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const UserTransferForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Find recipient by email
      const { data: recipient } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', formData.recipientEmail)
        .single();

      if (!recipient) {
        toast.error('User not found');
        return;
      }

      const amount = parseFloat(formData.amount);
      if (amount <= 0 || amount > (user.care_coins_balance || 0)) {
        toast.error('Invalid amount');
        return;
      }

      // Create transaction
      const { error } = await supabase
        .from('care_coins_transactions')
        .insert({
          amount: -amount,
          from_user_id: user.id,
          to_user_id: recipient.id,
          transaction_type: 'transfer',
          description: formData.description || `Transfer to ${recipient.name}`
        });

      if (error) throw error;

      toast.success('Transfer successful');
      setFormData({ recipientEmail: '', amount: '', description: '' });
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
        <CardTitle>Send to User</CardTitle>
        <CardDescription>
          Transfer CareCoins to another platform user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="user@example.com"
              value={formData.recipientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (CareCoins)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max={user?.care_coins_balance || 0}
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
            <p className="text-sm text-muted-foreground">
              Available: {user?.care_coins_balance || 0} CareCoins
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What's this for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send CareCoins'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserTransferForm;
