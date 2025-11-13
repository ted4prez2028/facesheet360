import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, Loader2 } from 'lucide-react';
import { cashOutCareCoins, getExchangeRate } from '@/lib/api/careCoinsApi';

export function DriverPayoutView() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [accountInfo, setAccountInfo] = useState({
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: driver } = useQuery({
    queryKey: ['driver-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('drivers')
        .select('care_coins_balance')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: exchangeRate } = useQuery({
    queryKey: ['exchangeRate'],
    queryFn: getExchangeRate,
    staleTime: 1000 * 60 * 10,
  });

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to request a payout');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!driver || amountNum > driver.care_coins_balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (paymentMethod === 'bank_transfer') {
      if (!accountInfo.accountName || !accountInfo.accountNumber || !accountInfo.routingNumber || !accountInfo.bankName) {
        toast.error('Please fill in all bank account details');
        return;
      }
    } else {
      if (!accountInfo.accountName) {
        toast.error('Please enter your account information');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const result = await cashOutCareCoins(
        user.id,
        amountNum,
        paymentMethod,
        accountInfo
      );

      if (result.success) {
        toast.success(`Payout request submitted for ${amountNum} CareCoins ($${result.usd_amount?.toFixed(2)} USD)`);
        setAmount('');
        setAccountInfo({
          accountName: '',
          accountNumber: '',
          routingNumber: '',
          bankName: '',
        });
      } else {
        toast.error(result.message || 'Failed to process payout request');
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast.error('An error occurred while processing your payout');
    } finally {
      setIsProcessing(false);
    }
  };

  const usdValue = amount && exchangeRate ? (parseFloat(amount) * Number(exchangeRate)).toFixed(2) : '0.00';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Request Payout
        </CardTitle>
        <CardDescription>
          Withdraw your earnings to real currency or gift cards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayout} className="space-y-4">
          <div>
            <Label htmlFor="balance">Available Balance</Label>
            <div className="text-2xl font-bold text-primary">
              {driver?.care_coins_balance.toFixed(2) || '0.00'} CC
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount (CareCoins)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={driver?.care_coins_balance || 0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            {amount && (
              <p className="text-sm text-muted-foreground mt-1">
                ≈ ${usdValue} USD
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="amazon_gift_card">Amazon Gift Card</SelectItem>
                <SelectItem value="visa_gift_card">Visa Gift Card</SelectItem>
                <SelectItem value="mastercard_gift_card">Mastercard Gift Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'bank_transfer' ? (
            <>
              <div>
                <Label htmlFor="account-name">Account Holder Name</Label>
                <Input
                  id="account-name"
                  value={accountInfo.accountName}
                  onChange={(e) => setAccountInfo({ ...accountInfo, accountName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  value={accountInfo.accountNumber}
                  onChange={(e) => setAccountInfo({ ...accountInfo, accountNumber: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label htmlFor="routing-number">Routing Number</Label>
                <Input
                  id="routing-number"
                  value={accountInfo.routingNumber}
                  onChange={(e) => setAccountInfo({ ...accountInfo, routingNumber: e.target.value })}
                  placeholder="987654321"
                />
              </div>
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={accountInfo.bankName}
                  onChange={(e) => setAccountInfo({ ...accountInfo, bankName: e.target.value })}
                  placeholder="Bank of America"
                />
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="account-email">
                {paymentMethod.includes('gift_card') ? 'Email Address' : 'Account Email/Username'}
              </Label>
              <Input
                id="account-email"
                value={accountInfo.accountName}
                onChange={(e) => setAccountInfo({ ...accountInfo, accountName: e.target.value })}
                placeholder={paymentMethod.includes('gift_card') ? 'your@email.com' : 'username or email'}
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Request Payout'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}