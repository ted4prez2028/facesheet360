import { useCareCoinAutoProcessor } from '@/hooks/useCareCoinAutoProcessor';

/**
 * Component to automatically process pending CareCoin distributions
 * Should be placed at the top level of authenticated routes
 */
export const CareCoinAutoProcessor = () => {
  useCareCoinAutoProcessor();
  return null; // This component doesn't render anything
};