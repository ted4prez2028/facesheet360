
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext';

interface PlatformTransferFormProps {
  recipient: string;
  recipientName: string;
  amount: number;
  isLoading: boolean;
  onRecipientChange: (value: string) => void;
  onRecipientNameChange: (value: string) => void;
  onAmountChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PlatformTransferForm: React.FC<PlatformTransferFormProps> = ({
  recipient,
  recipientName,
  amount,
  isLoading,
  onRecipientChange,
  onRecipientNameChange,
  onAmountChange,
  onSubmit
}) => {
  const { user } = useAuth();

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="recipient" className="text-right">
            Recipient ID
          </Label>
          <Input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
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
            onChange={(e) => onRecipientNameChange(e.target.value)}
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
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="col-span-3"
            placeholder="Amount"
            required
          />
        </div>
        <div className="p-1 border rounded flex items-center mb-4">
          <span className="text-sm font-medium px-3">Balance: {user?.care_coins_balance || user?.credits || 0} CC</span>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send CareCoins"}
        </Button>
      </DialogFooter>
    </form>
  );
};
