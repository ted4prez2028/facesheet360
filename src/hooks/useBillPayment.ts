
import { useState } from 'react';
import { payBillWithCareCoins } from '@/lib/api/careCoinsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { BillPaymentResult } from '@/types/health-predictions';

interface BillInfo {
  [key: string]: unknown; // Allow any properties for now, can be refined later
}

export const useBillPayment = () => {
  const [billType, setBillType] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientAccount, setRecipientAccount] = useState<string>('');
  const [billInfo, setBillInfo] = useState<BillInfo>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleBillPayment = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to pay bills with CareCoins");
      return false;
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (!billType || !recipientName || !recipientAccount) {
      toast.error("Please enter complete bill payment information");
      return false;
    }

    setIsProcessing(true);
    try {
      const result: BillPaymentResult = await payBillWithCareCoins(
        user.id,
        billType,
        amount,
        recipientName,
        recipientAccount,
        billInfo
      );

      if (result.success) {
        toast.success(`Successfully initiated payment of ${amount} CareCoins for your ${billType} bill`);
        resetForm();
        return true;
      } else {
        toast.error(result.message || "Failed to process bill payment");
        return false;
      }
    } catch (error: unknown) {
      console.error("Bill payment error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred during bill payment");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setBillType('');
    setAmount(0);
    setRecipientName('');
    setRecipientAccount('');
    setBillInfo({});
  };

  return {
    formState: {
      billType,
      amount,
      recipientName,
      recipientAccount,
      billInfo,
      isProcessing,
    },
    setters: {
      setBillType,
      setAmount,
      setRecipientName,
      setRecipientAccount,
      setBillInfo,
    },
    handleBillPayment,
    resetForm,
  };
};
