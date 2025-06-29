import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from "@/components/ui/dialog";
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

interface StakingFormProps {
  tokenBalance: string;
}

export const StakingForm: React.FC<StakingFormProps> = ({
  tokenBalance
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { stakeCareCoins, unstakeCareCoins, isWalletConnected } = useWallet();

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to stake CareCoins.");
      return;
    }
    if (amount <= 0) {
      toast.error("Please enter a valid amount to stake.");
      return;
    }
    setIsLoading(true);
    try {
      const success = await stakeCareCoins(amount.toString());
      if (success) {
        setAmount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to unstake CareCoins.");
      return;
    }
    if (amount <= 0) {
      toast.error("Please enter a valid amount to unstake.");
      return;
    }
    setIsLoading(true);
    try {
      const success = await unstakeCareCoins(amount.toString());
      if (success) {
        setAmount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stakeAmount" className="text-right">
            Amount
          </Label>
          <Input
            type="number"
            id="stakeAmount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="col-span-3"
            placeholder="Amount"
            required
          />
        </div>
        <div className="p-1 border rounded flex items-center mb-4">
          <span className="text-sm font-medium px-3">Available Balance: {tokenBalance} CARE</span>
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button type="button" onClick={handleStake} disabled={isLoading} className="flex-1">
          {isLoading ? "Staking..." : "Stake CareCoins"}
        </Button>
        <Button type="button" onClick={handleUnstake} disabled={isLoading} variant="outline" className="flex-1">
          {isLoading ? "Unstaking..." : "Unstake CareCoins"}
        </Button>
      </DialogFooter>
    </form>
  );
};
