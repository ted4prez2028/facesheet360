
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getProvider, getSigner, getCareCoinContract } from '@/lib/web3';
import { ethers } from 'ethers';

// This is a placeholder for the CareCoin token contract address
// In a real application, this would come from your deployment
const CARE_COIN_CONTRACT_ADDRESS = "0xYourCareCoinContractAddressHere"; 

export const useWallet = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateCurrentUser } = useAuth();

  const connectWallet = useCallback(async (address?: string) => {
    setIsLoading(true);
    try {
      let currentAddress = address;
      if (!currentAddress) {
        const signer = await getSigner();
        if (!signer) {
          toast.error('Failed to get signer. MetaMask might not be installed or connected.');
          setIsLoading(false);
          return false;
        }
        currentAddress = await signer.getAddress();
      }

      setWalletAddress(currentAddress);
      setIsWalletConnected(true);
      await updateBalances(currentAddress);

      // If user exists in our system, update their internal CareCoin balance
      if (user && updateCurrentUser) {
        const newBalance = (user.care_coins_balance || 0) + 10; // Bonus for connecting
        updateCurrentUser({ care_coins_balance: newBalance });
        toast.success('Wallet connected! You received 10 CareCoins as a bonus.');
      }
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateCurrentUser, updateBalances]);

  const updateBalances = useCallback(async (address: string) => {
    try {
      const provider = getProvider();
      if (!provider) return;

      // Get ETH balance
      const ethBalanceValue = ethers.formatEther(await provider.getBalance(address));
      setEthBalance(ethBalanceValue);

      // Get token balance if contract is deployed
      const careCoinContract = await getCareCoinContract(provider);
      if (careCoinContract) {
        const tokenBalanceValue = ethers.formatUnits(await careCoinContract.balanceOf(address), 18); // Assuming 18 decimals
        setTokenBalance(tokenBalanceValue);
      }
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }, []);

  const sendCareCoins = useCallback(async (toAddress: string, amount: string) => {
    setIsLoading(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        toast.error('MetaMask not connected or no signer available.');
        return false;
      }

      const careCoinContract = await getCareCoinContract(signer);
      if (!careCoinContract) {
        toast.error('CareCoin contract not found.');
        return false;
      }

      const amountInWei = ethers.parseUnits(amount, 18); // Assuming 18 decimals
      const tx = await careCoinContract.transfer(toAddress, amountInWei);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`Successfully sent ${amount} CareCoins to ${toAddress}`);
        await updateBalances(await signer.getAddress()); // Refresh balance after transaction
        return true;
      } else {
        toast.error('Transaction failed.');
        return false;
      }
    } catch (error) {
      console.error('Error sending CareCoins:', error);
      toast.error(`Failed to send CareCoins: ${error.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateBalances]);

  const stakeCareCoins = useCallback(async (amount: string) => {
    setIsLoading(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        toast.error('MetaMask not connected or no signer available.');
        return false;
      }

      const careCoinContract = await getCareCoinContract(signer);
      if (!careCoinContract) {
        toast.error('CareCoin contract not found.');
        return false;
      }

      const amountInWei = ethers.parseUnits(amount, 18); // Assuming 18 decimals
      const tx = await careCoinContract.stake(amountInWei);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`Successfully staked ${amount} CareCoins.`);
        await updateBalances(await signer.getAddress()); // Refresh balance after transaction
        return true;
      } else {
        toast.error('Staking transaction failed.');
        return false;
      }
    } catch (error) {
      console.error('Error staking CareCoins:', error);
      toast.error(`Failed to stake CareCoins: ${error.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateBalances]);

  const unstakeCareCoins = useCallback(async (amount: string) => {
    setIsLoading(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        toast.error('MetaMask not connected or no signer available.');
        return false;
      }

      const careCoinContract = await getCareCoinContract(signer);
      if (!careCoinContract) {
        toast.error('CareCoin contract not found.');
        return false;
      }

      const amountInWei = ethers.parseUnits(amount, 18); // Assuming 18 decimals
      const tx = await careCoinContract.unstake(amountInWei);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`Successfully unstaked ${amount} CareCoins.`);
        await updateBalances(await signer.getAddress()); // Refresh balance after transaction
        return true;
      } else {
        toast.error('Unstaking transaction failed.');
        return false;
      }
    } catch (error) {
      console.error('Error unstaking CareCoins:', error);
      toast.error(`Failed to unstake CareCoins: ${error.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateBalances]);

  const mintCareCoins = useCallback(async (toAddress: string, amount: string, metadataHash: string) => {
    setIsLoading(true);
    try {
      // IMPORTANT: In a production environment, this minting function should ONLY be called from a secure backend service
      // that holds the minter's private key, not directly from the frontend.
      // This frontend implementation is for demonstration/testing purposes only.

      const signer = await getSigner();
      if (!signer) {
        toast.error('MetaMask not connected or no signer available. Cannot mint from frontend.');
        return false;
      }

      const careCoinContract = await getCareCoinContract(signer);
      if (!careCoinContract) {
        toast.error('CareCoin contract not found.');
        return false;
      }

      const amountInWei = ethers.parseUnits(amount, 18); // Assuming 18 decimals
      const tx = await careCoinContract.mint(toAddress, amountInWei, metadataHash);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`Successfully minted ${amount} CareCoins to ${toAddress} with metadata ${metadataHash}.`);
        await updateBalances(await signer.getAddress()); // Refresh balance after transaction
        return true;
      } else {
        toast.error('Minting transaction failed.');
        return false;
      }
    } catch (error) {
      console.error('Error minting CareCoins:', error);
      toast.error(`Failed to mint CareCoins: ${error.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateBalances]);

  useEffect(() => {
    const initWallet = async () => {
      const provider = getProvider();
      if (provider) {
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          await connectWallet(accounts[0]);
        }

        window.ethereum?.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            connectWallet(newAccounts[0]);
          } else {
            setIsWalletConnected(false);
            setWalletAddress(null);
            setEthBalance('0');
            setTokenBalance('0');
          }
        });

        window.ethereum?.on('chainChanged', () => {
          window.location.reload();
        });
      }
    };

    initWallet();

    return () => {
      // Clean up event listeners if necessary
      window.ethereum?.removeListener('accountsChanged', () => {});
      window.ethereum?.removeListener('chainChanged', () => {});
    };
  }, [connectWallet]);

  const refreshBalances = useCallback(async () => {
    if (!walletAddress) return;
    await updateBalances(walletAddress);
  }, [walletAddress, updateBalances]);

  return {
    isWalletConnected,
    walletAddress,
    ethBalance,
    tokenBalance,
    isLoading,
    connectWallet,
    sendCareCoins,
    stakeCareCoins,
    unstakeCareCoins,
    refreshBalances,
    mintCareCoins
  };
};
