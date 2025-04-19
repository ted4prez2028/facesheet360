
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletBalance } from './WalletBalance';
import { CareCoinsActivity } from './CareCoinsActivity';
import { CareCoinsRewards } from './CareCoinsRewards';
import { CoinsSummaryView } from './CoinsSummaryView';
import { CashOutView } from './CashOutView';
import { VirtualCardView } from './VirtualCardView';
import { BillPaymentView } from './BillPaymentView';
import { AchievementsView } from './AchievementsView';
import { HealthcareTransferView } from './HealthcareTransferView';

export const CareCoinsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletBalance />
          <div className="mt-6">
            <CoinsSummaryView />
          </div>
        </div>
        <div className="lg:col-span-2">
          <CareCoinsActivity />
        </div>
      </div>

      <Tabs defaultValue="transfer" className="mt-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="transfer">Transfers</TabsTrigger>
          <TabsTrigger value="cashout">Cash Out</TabsTrigger>
          <TabsTrigger value="cards">Virtual Cards</TabsTrigger>
          <TabsTrigger value="bills">Bill Payments</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transfer" className="space-y-4 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <HealthcareTransferView />
            <CareCoinsRewards />
          </div>
        </TabsContent>
        
        <TabsContent value="cashout" className="space-y-4 pt-4">
          <CashOutView />
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4 pt-4">
          <VirtualCardView />
        </TabsContent>
        
        <TabsContent value="bills" className="space-y-4 pt-4">
          <BillPaymentView />
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4 pt-4">
          <AchievementsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
