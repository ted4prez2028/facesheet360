
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Patient } from '@/types';
import { SwitchCamera, Volume2, VolumeX } from 'lucide-react';
import { 
  checkCameraAvailability, 
  initializeCamera, 
  captureImage,
  identifyPatient,
  registerFace,
  detectFaceInCanvas,
  stopCamera
} from './utils/faceCaptureUtils';
import { 
  playFaceDetectedSound, 
  playCaptureSuccessSound, 
  playCountdownSound,
  setMuted,
  isSoundMuted
} from '@/utils/soundEffects';
import { hapticLight, hapticSuccess, hapticMedium } from '@/utils/hapticFeedback';
import FaceCaptureError from './components/FaceCaptureError';
import CameraControls from './components/CameraControls';
import CapturedImage from './components/CapturedImage';
import NoCameraState from './components/NoCameraState';
import ModelLoadingProgress, { ModelProgress } from './ModelLoadingProgress';
import OfflineIndicator from './OfflineIndicator';

export type FaceCaptureProps = {
  mode?: 'register' | 'identify';
  patientId?: string;
  userId?: string;
  onSuccess?: (data: Patient) => void;
  onCapture?: (faceData: string) => void;
};

const FaceCapture: React.FC<FaceCaptureProps> = ({
  mode = 'identify',
  patientId,
  userId,
  onSuccess,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceDetectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVideoStream, setHasVideoStream] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [modelsReady, setModelsReady] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPlayedDetectionSound, setHasPlayedDetectionSound] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());
  const [showFlash, setShowFlash] = useState(false);
  const [modelProgress, setModelProgress] = useState<ModelProgress[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const animationFrameId = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network back online');
      setIsOffline(false);
      setError(null);
    };

    const handleOffline = () => {
      console.log('📴 Network offline');
      setIsOffline(true);
      setError('You are offline. Facial recognition requires an internet connection.');
      
      // Stop camera if running
      if (hasVideoStream) {
        stopCamera(videoRef);
        setHasVideoStream(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasVideoStream]);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !faceDetectionCanvasRef.current) return;
    
    const detectFacesLoop = async () => {
      if (videoRef.current && faceDetectionCanvasRef.current && hasVideoStream && !isCaptured) {
        try {
          const result = await detectFaceInCanvas(
            videoRef.current, 
            faceDetectionCanvasRef.current
          );
          setFaceDetected(result.detected);
          setFaceConfidence(result.confidence);
          
          // Play sound when face is first detected
          if (result.detected && !hasPlayedDetectionSound) {
            playFaceDetectedSound();
            hapticLight();
            setHasPlayedDetectionSound(true);
          } else if (!result.detected) {
            setHasPlayedDetectionSound(false);
          }
          
          // Start countdown if confidence > 90%
          if (result.detected && result.confidence >= 90 && !countdown && !countdownTimerRef.current) {
            startCountdown();
          } else if (result.confidence < 90 && countdownTimerRef.current) {
            // Cancel countdown if confidence drops
            clearTimeout(countdownTimerRef.current);
            countdownTimerRef.current = null;
            setCountdown(null);
          }
          
          // Continue the loop only if no errors
          const id = requestAnimationFrame(detectFacesLoop);
          animationFrameId.current = id;
        } catch (err) {
          console.error('❌ Face detection loop error:', err);
          // Stop the detection loop on error
          if (animationFrameId.current !== null) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
          setError('Face detection failed. Please try restarting the camera.');
          setHasVideoStream(false);
          stopCamera(videoRef);
        }
      }
    };
    
    detectFacesLoop();
  }, [hasVideoStream, isCaptured, hasPlayedDetectionSound, countdown]);

  useEffect(() => {
    const checkCamera = async () => {
      const hasCamera = await checkCameraAvailability();
      setHasCamera(hasCamera);
      if (!hasCamera) {
        setError("Camera not found. Please connect a camera and try again.");
      }
    };

    checkCamera();
    
    // Cleanup animation frame and countdown on unmount
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, []);

  // Start face detection when models are ready
  useEffect(() => {
    if (modelsReady && hasVideoStream && !isCaptured) {
      startFaceDetection();
    }
  }, [modelsReady, hasVideoStream, isCaptured, startFaceDetection]);

  const startCountdown = () => {
    setCountdown(3);
    playCountdownSound();
    hapticMedium();
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          countdownTimerRef.current = null;
          handleCapture();
          return null;
        }
        playCountdownSound();
        hapticMedium();
        return prev - 1;
      });
    }, 1000);
    
    countdownTimerRef.current = countdownInterval as unknown as NodeJS.Timeout;
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    setIsCaptured(false);
    setCapturedImage(null);
    setModelsReady(false);
    setIsLoadingModels(true);
    setCountdown(null);
    setModelProgress([]);
    
    // Check if offline
    if (!navigator.onLine) {
      setError("You are offline. Facial recognition requires an internet connection.");
      setIsLoading(false);
      setIsLoadingModels(false);
      return;
    }
    
    try {
      const { success, modelsLoaded } = await initializeCamera(
        videoRef, 
        (ready) => {
          setModelsReady(ready);
          setIsLoadingModels(false);
        }, 
        facingMode,
        (progress) => {
          setModelProgress(progress);
        }
      );
      
      if (!success) {
        setError("Camera initialization failed. Please check camera permissions and try again.");
        setHasVideoStream(false);
        setIsLoading(false);
        setIsLoadingModels(false);
      } else {
        setHasVideoStream(true);
        setIsLoading(false);
        setError(null);
        
        // Wait for models to be ready before starting face detection
        if (modelsLoaded) {
          setModelsReady(true);
          setIsLoadingModels(false);
        }
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Provide user-friendly offline error
      if (errorMessage.includes('offline') || errorMessage.includes('network')) {
        setError('Network connection required. Please connect to the internet and try again.');
      } else {
        setError(`Camera error: ${errorMessage}`);
      }
      
      setHasVideoStream(false);
      setIsLoading(false);
      setIsLoadingModels(false);
    }
  };

  const handleFlipCamera = async () => {
    // Stop current camera
    stopCamera(videoRef);
    
    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Stop detection loop
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    // Restart camera with new facing mode
    setHasVideoStream(false);
    await startCamera();
  };

  const toggleMute = () => {
    const newMutedState = !soundMuted;
    setSoundMuted(newMutedState);
    setMuted(newMutedState);
  };

  const handleCapture = () => {
    // Clear countdown if active
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setCountdown(null);
    }
    
    const imageDataURL = captureImage(videoRef, canvasRef);
    if (imageDataURL) {
      // Show flash effect
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
      
      setCapturedImage(imageDataURL);
      setIsCaptured(true);
      playCaptureSuccessSound();
      hapticSuccess();
      
      // Stop detection loop on capture
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    } else {
      setError("Failed to capture image. Please try again.");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsCaptured(false);
    setError(null);
    // Restart face detection
    if (modelsReady && hasVideoStream) {
      startFaceDetection();
    }
  };

  const handleIdentify = async () => {
    if (!capturedImage) {
      setError("No image captured. Please capture an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const matchedPatient = await identifyPatient(capturedImage);
    setIsLoading(false);
    
    if (matchedPatient) {
      onSuccess?.(matchedPatient);
    } else {
      setError("No matching patient found.");
    }
  };

  const handleRegisterFace = async () => {
    if (!capturedImage) {
      setError("No image captured. Please capture an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const faceDataString = await registerFace(capturedImage, patientId);
    setIsLoading(false);
    
    if (faceDataString) {
      onCapture?.(faceDataString);
      if (patientId || userId) {
        onSuccess?.({ id: patientId || userId! } as Patient);
      }
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <FaceCaptureError error={error} />
        
        {/* Offline Indicator */}
        {isOffline && (
          <OfflineIndicator onRetry={startCamera} />
        )}

        {!hasCamera ? (
          <NoCameraState />
        ) : (
          <>
            <div className="relative w-full max-w-md">
              <video 
                ref={videoRef} 
                className="w-full rounded-md" 
                autoPlay 
                playsInline 
                muted
              />
              <canvas 
                ref={faceDetectionCanvasRef} 
                className="absolute top-0 left-0 w-full h-full rounded-md pointer-events-none"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Flash Effect */}
              {showFlash && (
                <div className="absolute top-0 left-0 w-full h-full bg-white rounded-md animate-fade-out pointer-events-none" />
              )}
              
              {/* Loading Models Overlay */}
              {isLoadingModels && hasVideoStream && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-md z-10">
                  <ModelLoadingProgress models={modelProgress} />
                </div>
              )}
              
              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-md pointer-events-none">
                  <div className="text-white text-8xl font-bold animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
              
              {/* Face Detected Indicator */}
              {hasVideoStream && !isCaptured && !isLoadingModels && countdown === null && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${faceDetected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                  <div className="text-white bg-green-600/90 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30 shadow-lg flex items-center gap-2">
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-medium text-sm">
                      Face Detected - {faceConfidence}%
                      {faceConfidence >= 90 && ' - Auto-capturing...'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Camera Flip Button */}
              {hasVideoStream && !isCaptured && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
                    onClick={toggleMute}
                  >
                    {soundMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
                    onClick={handleFlipCamera}
                    disabled={isLoading}
                  >
                    <SwitchCamera className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            {!isCaptured ? (
              <CameraControls
                isCaptured={isCaptured}
                isLoading={isLoading}
                hasVideoStream={hasVideoStream}
                onStartCamera={startCamera}
                onCapture={handleCapture}
                isFaceDetected={faceDetected}
                countdown={countdown}
              />
            ) : capturedImage ? (
              <CapturedImage
                capturedImage={capturedImage}
                isLoading={isLoading}
                mode={mode}
                faceConfidence={faceConfidence}
                onIdentify={handleIdentify}
                onRegister={handleRegisterFace}
                onRetake={handleRetake}
              />
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
};

export default FaceCapture;
