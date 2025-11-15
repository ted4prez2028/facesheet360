import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Info } from 'lucide-react';

interface StakingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'stake' | 'unstake';
  currentBalance: number;
  onSuccess?: () => void;
}

const STAKING_PERIODS = [
  { days: 30, apy: 5 },
  { days: 90, apy: 8 },
  { days: 180, apy: 12 },
  { days: 365, apy: 15 }
];

export function StakingDialog({ open, onOpenChange, mode, currentBalance, onSuccess }: StakingDialogProps) {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const selectedPeriod = STAKING_PERIODS.find(p => p.days === parseInt(period));
  const estimatedRewards = selectedPeriod 
    ? (parseFloat(amount) || 0) * (selectedPeriod.apy / 100) * (selectedPeriod.days / 365)
    : 0;

  const handleStake = async () => {
    if (!user || !amount) return;

    const stakeAmount = parseFloat(amount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (stakeAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(period));

      const { error } = await supabase
        .from('carecoin_staking')
        .insert({
          user_id: user.id,
          staked_amount: stakeAmount,
          staking_period_days: parseInt(period),
          end_date: endDate.toISOString(),
          apy_rate: selectedPeriod?.apy || 5,
          status: 'active'
        });

      if (error) throw error;

      toast.success(`Successfully staked ${stakeAmount} CareCoins`);
      onOpenChange(false);
      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Error staking:', error);
      toast.error('Failed to stake CareCoins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{mode === 'stake' ? 'Stake' : 'Unstake'} CareCoins</DialogTitle>
          <DialogDescription>
            {mode === 'stake' 
              ? 'Lock your CareCoins to earn rewards'
              : 'Withdraw your staked CareCoins'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'stake' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                max={currentBalance}
              />
              <p className="text-xs text-muted-foreground">
                Available: {currentBalance.toFixed(2)} CARE
              </p>
            </div>

            <div className="space-y-2">
              <Label>Staking Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAKING_PERIODS.map((p) => (
                    <SelectItem key={p.days} value={p.days.toString()}>
                      {p.days} days ({p.apy}% APY)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {amount && selectedPeriod && (
              <div className="rounded-lg bg-primary/5 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Staking Summary</p>
                    <p className="text-muted-foreground">
                      Staking {parseFloat(amount).toFixed(2)} CARE for {selectedPeriod.days} days
                    </p>
                    <p className="text-muted-foreground">
                      Estimated rewards: <span className="font-semibold text-foreground">
                        {estimatedRewards.toFixed(2)} CARE
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Unstaking feature will be available once you have active stakes.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {mode === 'stake' && (
            <Button onClick={handleStake} disabled={!amount || loading}>
              {loading ? 'Staking...' : 'Stake'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
