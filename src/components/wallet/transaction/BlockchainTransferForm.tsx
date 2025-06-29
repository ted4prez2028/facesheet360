
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BlockchainTransferFormProps {
  ethereumAddress: string;
  amount: number;
  tokenBalance: string;
  isLoading: boolean;
  onEthereumAddressChange: (value: string) => void;
  onAmountChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BlockchainTransferForm: React.FC<BlockchainTransferFormProps> = ({
  isWalletConnected,
  ethereumAddress,
  amount,
  tokenBalance,
  isLoading,
  onEthereumAddressChange,
  onAmountChange,
  onSubmit
}) => {
  if (!isWalletConnected) {
    return (
      <Alert className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet first to send blockchain CareCoins.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ethereumAddress" className="text-right">
            ETH Address
          </Label>
          <Input
            type="text"
            id="ethereumAddress"
            value={ethereumAddress}
            onChange={(e) => onEthereumAddressChange(e.target.value)}
            className="col-span-3 font-mono"
            placeholder="0x..."
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tokenAmount" className="text-right">
            Amount
          </Label>
          <Input
            type="number"
            id="tokenAmount"
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="col-span-3"
            placeholder="Amount"
            required
          />
        </div>
        <div className="p-1 border rounded flex items-center mb-4">
          <span className="text-sm font-medium px-3">Token Balance: {tokenBalance} CARE</span>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send On Blockchain"}
        </Button>
      </DialogFooter>
    </form>
  );
};
