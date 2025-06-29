import { useState } from 'react';
import { toast } from 'sonner';
import { useWallet } from './useWallet';

export const useTransactionForm = () => {
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { sendCareCoins } = useWallet();

  const handlePlatformTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate platform transfer logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Successfully sent ${amount} CareCoins to ${recipientName} on platform.`);
      return true;
    } catch (error) {
      console.error('Platform transfer error:', error);
      toast.error('Failed to send CareCoins on platform.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockchainTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await sendCareCoins(ethereumAddress, amount.toString());
      if (success) {
        toast.success(`Successfully sent ${amount} CareCoins to ${ethereumAddress} on blockchain.`);
      }
      return success;
    } catch (error) {
      console.error('Blockchain transfer error:', error);
      toast.error('Failed to send CareCoins on blockchain.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState: {
      recipient,
      recipientName,
      amount,
      ethereumAddress,
      isLoading,
    },
    setters: {
      setRecipient,
      setRecipientName,
      setAmount,
      setEthereumAddress,
    },
    handlers: {
      handlePlatformTransfer,
      handleBlockchainTransfer,
    },
  };
};