
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionForm } from '@/hooks/useTransactionForm';

const HealthcareTransferView = () => {
  const { sendTransaction, isLoading } = useTransactionForm();
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    description: '',
    transferType: 'colleague'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendTransaction({
      amount: parseFloat(formData.amount),
      recipientEmail: formData.recipientEmail,
      description: formData.description
    });
    setFormData({
      recipientEmail: '',
      amount: '',
      description: '',
      transferType: 'colleague'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Healthcare Transfer</CardTitle>
        <CardDescription>
          Transfer CareCoins to colleagues or patients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transferType">Transfer Type</Label>
            <Select
              value={formData.transferType}
              onValueChange={(value) => handleInputChange('transferType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colleague">To Colleague</SelectItem>
                <SelectItem value="patient">To Patient</SelectItem>
                <SelectItem value="reward">Team Reward</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="colleague@hospital.com"
              value={formData.recipientEmail}
              onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (CareCoins)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What's this transfer for?"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
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

export default HealthcareTransferView;
