import { useEffect, useState } from 'react';
import { loadFaceDetectionModels } from '@/lib/facialRecognition';
import { toast } from 'sonner';

interface PreloadState {
  isPreloading: boolean;
  isPreloaded: boolean;
  error: string | null;
  isOffline: boolean;
}

export const useFacialRecognitionPreload = () => {
  const [state, setState] = useState<PreloadState>({
    isPreloading: false,
    isPreloaded: false,
    error: null,
    isOffline: !navigator.onLine,
  });

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      console.log('🌐 Network back online');
      setState(prev => ({ ...prev, isOffline: false }));
      
      // Retry preloading if not already preloaded
      if (!state.isPreloaded && !state.isPreloading) {
        preloadModels();
      }
    };

    const handleOffline = () => {
      console.log('📴 Network offline');
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isPreloaded, state.isPreloading]);

  const preloadModels = async () => {
    if (state.isPreloading || state.isPreloaded) {
      return;
    }

    // Check if offline
    if (!navigator.onLine) {
      console.log('📴 Skipping preload - device is offline');
      setState({
        isPreloading: false,
        isPreloaded: false,
        error: 'Device is offline',
        isOffline: true,
      });
      return;
    }

    setState(prev => ({ ...prev, isPreloading: true, error: null }));
    console.log('🔄 Starting background preload of facial recognition models...');

    try {
      await loadFaceDetectionModels();
      
      setState({
        isPreloading: false,
        isPreloaded: true,
        error: null,
        isOffline: false,
      });
      
      console.log('✅ Facial recognition models preloaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to preload facial recognition models:', errorMessage);
      
      setState({
        isPreloading: false,
        isPreloaded: false,
        error: errorMessage,
        isOffline: !navigator.onLine,
      });
    }
  };

  // Start preloading on mount
  useEffect(() => {
    // Delay preload slightly to avoid blocking initial render
    const timer = setTimeout(() => {
      preloadModels();
    }, 2000); // Wait 2 seconds after app loads

    return () => clearTimeout(timer);
  }, []);

  return {
    ...state,
    retryPreload: preloadModels,
  };
};
