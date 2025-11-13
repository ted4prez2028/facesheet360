import { useEffect, useState } from 'react';
import { useFacialRecognitionPreload } from '@/hooks/useFacialRecognitionPreload';
import { toast } from 'sonner';
import { WifiOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function FacialRecognitionPreloader() {
  const { isPreloading, isPreloaded, error, isOffline, retryPreload } = useFacialRecognitionPreload();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Show toast when preloading starts (only once)
    if (isPreloading && !showToast) {
      setShowToast(true);
      toast.info(
        'Facial recognition models loading in background...',
        {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          duration: 3000,
        }
      );
    }

    // Show success toast when preloaded
    if (isPreloaded && showToast) {
      toast.success(
        'Facial recognition ready!',
        {
          icon: <CheckCircle2 className="h-4 w-4" />,
          duration: 2000,
        }
      );
    }

    // Show offline warning
    if (isOffline && showToast) {
      toast.warning(
        'Facial recognition unavailable offline',
        {
          icon: <WifiOff className="h-4 w-4" />,
          duration: 4000,
          action: navigator.onLine ? {
            label: 'Retry',
            onClick: retryPreload,
          } : undefined,
        }
      );
    }

    // Show error with retry option
    if (error && !isOffline && showToast) {
      toast.error(
        'Failed to load facial recognition models',
        {
          description: 'Click retry to try again',
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: retryPreload,
          },
        }
      );
    }
  }, [isPreloading, isPreloaded, error, isOffline, showToast, retryPreload]);

  // This component doesn't render anything visible
  return null;
}
