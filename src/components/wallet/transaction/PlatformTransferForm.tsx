
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const PlatformTransferForm = () => {
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const platforms = [
    { value: 'paypal', label: 'PayPal' },
    { value: 'venmo', label: 'Venmo' },
    { value: 'cashapp', label: 'Cash App' },
    { value: 'zelle', label: 'Zelle' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to transfer Care Coins",
        variant: "destructive"
      });
      return;
    }

    if (!amount || !platform || !accountInfo) {
      toast({
        title: "Error", 
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseInt(amount);
    const currentBalance = user.care_coins_balance || 0;

    if (transferAmount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough Care Coins for this transfer",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - in real implementation, this would call a backend service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Transfer Initiated",
        description: `Your transfer of ${amount} Care Coins to ${platform} has been initiated. You'll receive confirmation within 24 hours.`
      });
      
      // Reset form
      setAmount('');
      setPlatform('');
      setAccountInfo('');
      
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer to Platform</CardTitle>
        <CardDescription>
          Convert your Care Coins to cash on external platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Care Coins)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={user?.care_coins_balance || 0}
            />
            {user && (
              <p className="text-sm text-muted-foreground">
                Available balance: {user.care_coins_balance || 0} Care Coins
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account Information</Label>
            <Input
              id="account"
              placeholder="Enter your account handle/email"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Transfer...
              </>
            ) : (
              'Transfer Care Coins'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlatformTransferForm;
