
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { transferCareCoins } from '@/lib/supabaseApi';
import { transferCareCoinsToken } from '@/lib/carecoin';
import { toast } from 'sonner';

const CARE_COIN_CONTRACT_ADDRESS = '0x123456789abcdef123456789abcdef123456789a';

export const useTransactionForm = () => {
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState(0);
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateCurrentUser } = useAuth();

  const handlePlatformTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (amount <= 0) {
      toast.error("Please enter an amount greater than 0.");
      return;
    }
    
    if (amount > (user.careCoinsBalance || 0)) {
      toast.error("Insufficient balance for this transaction.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await transferCareCoins(user.id, recipient, amount);
      
      if (updateCurrentUser) {
        updateCurrentUser({
          careCoinsBalance: (user.careCoinsBalance || 0) - amount
        });
      }
      
      toast.success(`You have sent ${amount} CareCoins to ${recipientName}.`);
      
      // Reset form
      setRecipient("");
      setRecipientName("");
      setAmount(0);
      
      return true;
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Failed to send CareCoins. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockchainTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error("Please enter an amount greater than 0.");
      return false;
    }
    
    if (!ethereumAddress || !ethereumAddress.startsWith('0x')) {
      toast.error("Please enter a valid Ethereum address");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const success = await transferCareCoinsToken(
        CARE_COIN_CONTRACT_ADDRESS,
        ethereumAddress,
        amount.toString()
      );

      if (success) {
        // Reset form
        setEthereumAddress("");
        setAmount(0);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Blockchain transfer error:", error);
      toast.error(error.message || "Failed to send CareCoins. Please try again.");
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
      isLoading
    },
    setters: {
      setRecipient,
      setRecipientName,
      setAmount,
      setEthereumAddress
    },
    handlers: {
      handlePlatformTransfer,
      handleBlockchainTransfer
    }
  };
};
