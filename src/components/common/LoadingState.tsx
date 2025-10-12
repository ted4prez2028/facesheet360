/**
 * Modern Loading States
 */

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({ message = 'Loading...', size = 'md' }: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};

export const PageLoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingState size="lg" message="Loading application..." />
  </div>
);

export const InlineLoadingState = ({ message }: { message?: string }) => (
  <div className="flex items-center gap-2 py-2">
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    {message && <span className="text-sm text-muted-foreground">{message}</span>}
  </div>
);
