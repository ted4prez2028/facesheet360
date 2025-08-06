import React from 'react';
import TaxiService from '@/components/taxi/TaxiService';
import DashboardLayout from '@/components/layout/DashboardLayout';

const TaxiPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Taxi Service</h1>
          <p className="text-muted-foreground">
            Book rides between healthcare facilities, appointments, and home using CareCoins
          </p>
        </div>
        <TaxiService />
      </div>
    </DashboardLayout>
  );
};

export default TaxiPage;