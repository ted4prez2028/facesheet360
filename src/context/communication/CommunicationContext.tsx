
import React, { createContext, useContext } from 'react';
import { useCommunicationState } from './useCommunicationState';

interface CommunicationContextType {
  state: ReturnType<typeof useCommunicationState>;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useCommunicationState();

  return (
    <CommunicationContext.Provider value={{ state }}>
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context.state;
};
