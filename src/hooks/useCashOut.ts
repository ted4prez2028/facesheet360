
import { useState } from 'react';
import { cashOutCareCoins, convertCareCoinsToUSD, getExchangeRate } from '@/lib/api/careCoinsApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { CashOutResult } from '@/types/health-predictions';

export const useCashOut = () => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [accountInfo, setAccountInfo] = useState({
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const { data: exchangeRate, isLoading: isLoadingRate } = useQuery({
    queryKey: ['exchangeRate'],
    queryFn: getExchangeRate,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const { data: usdAmount, isLoading: isLoadingConversion } = useQuery({
    queryKey: ['convertToUSD', amount],
    queryFn: () => convertCareCoinsToUSD(amount),
    enabled: amount > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleCashOut = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to cash out CareCoins");
      return;
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!accountInfo.accountName || !accountInfo.accountNumber || !accountInfo.routingNumber) {
      toast.error("Please enter complete bank account information");
      return;
    }

    setIsProcessing(true);
    try {
      const result: CashOutResult = await cashOutCareCoins(
        user.id,
        amount,
        paymentMethod,
        accountInfo
      );

      if (result.success) {
        const usdAmountDisplay = result.usd_amount?.toFixed(2) || '0.00';
        toast.success(`Successfully cashed out ${amount} CareCoins for $${usdAmountDisplay} USD`);
        setAmount(0);
        return true;
      } else {
        toast.error(result.message || "Failed to cash out CareCoins");
        return false;
      }
    } catch (error: any) {
      console.error("Cash out error:", error);
      toast.error(error.message || "An error occurred during cash out");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    formState: {
      amount,
      paymentMethod,
      accountInfo,
      isProcessing,
    },
    exchangeRate,
    usdAmount,
    isLoading: isLoadingRate || isLoadingConversion,
    setters: {
      setAmount,
      setPaymentMethod,
      setAccountInfo,
    },
    handleCashOut,
  };
};
