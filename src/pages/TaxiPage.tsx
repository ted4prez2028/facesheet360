import React from 'react';
import TaxiService from '@/components/taxi/TaxiService';

const TaxiPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Taxi Service</h1>
        <p className="text-muted-foreground">
          Book rides between healthcare facilities, appointments, and home using CareCoins
        </p>
      </div>
      <TaxiService />
    </div>
  );
};

export default TaxiPage;