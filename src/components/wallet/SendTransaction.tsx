
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@/hooks/useWallet';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { PlatformTransferForm } from './transaction/PlatformTransferForm';
import { BlockchainTransferForm } from './transaction/BlockchainTransferForm';

const SendTransaction = () => {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("platform");
  const { isWalletConnected, tokenBalance } = useWallet();
  const { 
    formState: { recipient, recipientName, amount, ethereumAddress, isLoading },
    setters: { setRecipient, setRecipientName, setAmount, setEthereumAddress },
    handlers: { handlePlatformTransfer, handleBlockchainTransfer }
  } = useTransactionForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    let success = false;
    
    if (selectedTab === "platform") {
      success = await handlePlatformTransfer(e);
    } else {
      success = await handleBlockchainTransfer(e);
    }
    
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Send CareCoins</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send CareCoins</DialogTitle>
          <DialogDescription>
            Send CareCoins on the platform or blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="platform" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platform">Platform Transfer</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Transfer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="platform">
            <PlatformTransferForm
              recipient={recipient}
              recipientName={recipientName}
              amount={amount}
              isLoading={isLoading}
              onRecipientChange={setRecipient}
              onRecipientNameChange={setRecipientName}
              onAmountChange={setAmount}
              onSubmit={handleFormSubmit}
            />
          </TabsContent>
          
          <TabsContent value="blockchain">
            <BlockchainTransferForm
              isWalletConnected={isWalletConnected}
              ethereumAddress={ethereumAddress}
              amount={amount}
              tokenBalance={tokenBalance}
              isLoading={isLoading}
              onEthereumAddressChange={setEthereumAddress}
              onAmountChange={setAmount}
              onSubmit={handleFormSubmit}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SendTransaction;
