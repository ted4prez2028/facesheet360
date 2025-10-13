import React from 'react';
import { ProviderCommunication } from '@/components/communication/ProviderCommunication';

export default function Communication() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Provider Communication</h1>
        <p className="text-muted-foreground">Secure HIPAA-compliant messaging and calling</p>
      </div>
      <ProviderCommunication />
    </div>
  );
}
