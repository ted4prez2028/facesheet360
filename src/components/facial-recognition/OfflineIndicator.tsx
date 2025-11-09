import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

export default function OfflineIndicator({ onRetry }: OfflineIndicatorProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Facial recognition is unavailable offline. Please connect to the internet to use this feature.
        </span>
        {onRetry && navigator.onLine && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
