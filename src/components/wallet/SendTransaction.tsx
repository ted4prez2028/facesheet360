
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformTransferForm from './transaction/PlatformTransferForm';
import UserTransferForm from './transaction/UserTransferForm';

const SendTransaction = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platform">Transfer to Platform</TabsTrigger>
          <TabsTrigger value="user">Send to User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platform" className="space-y-4">
          <PlatformTransferForm />
        </TabsContent>
        
        <TabsContent value="user" className="space-y-4">
          <UserTransferForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SendTransaction;
