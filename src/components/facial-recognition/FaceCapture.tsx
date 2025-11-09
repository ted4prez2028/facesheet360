
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Patient } from '@/types';
import { 
  checkCameraAvailability, 
  initializeCamera, 
  captureImage,
  identifyPatient,
  registerFace,
  detectFaceInCanvas
} from './utils/faceCaptureUtils';
import FaceCaptureError from './components/FaceCaptureError';
import CameraControls from './components/CameraControls';
import CapturedImage from './components/CapturedImage';
import NoCameraState from './components/NoCameraState';

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
  const [modelsReady, setModelsReady] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !faceDetectionCanvasRef.current) return;
    
    const detectFacesLoop = async () => {
      if (videoRef.current && faceDetectionCanvasRef.current && hasVideoStream && !isCaptured) {
        const faceDetected = await detectFaceInCanvas(
          videoRef.current, 
          faceDetectionCanvasRef.current
        );
        setFaceDetected(faceDetected);
        
        // Continue the loop
        const id = requestAnimationFrame(detectFacesLoop);
        animationFrameId.current = id;
      }
    };
    
    detectFacesLoop();
  }, [hasVideoStream, isCaptured]);

  useEffect(() => {
    const checkCamera = async () => {
      const hasCamera = await checkCameraAvailability();
      setHasCamera(hasCamera);
      if (!hasCamera) {
        setError("Camera not found. Please connect a camera and try again.");
      }
    };

    checkCamera();
    
    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Start face detection when models are ready
  useEffect(() => {
    if (modelsReady && hasVideoStream && !isCaptured) {
      startFaceDetection();
    }
  }, [modelsReady, hasVideoStream, isCaptured, startFaceDetection]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    setIsCaptured(false);
    setCapturedImage(null);
    setModelsReady(false);
    
    try {
      const { success, modelsLoaded } = await initializeCamera(videoRef, setModelsReady);
      
      if (!success) {
        setError("Camera initialization failed. Please check camera permissions and try again.");
        setHasVideoStream(false);
        setIsLoading(false);
      } else {
        setHasVideoStream(true);
        setIsLoading(false);
        setError(null);
        
        // Wait for models to be ready before starting face detection
        if (modelsLoaded) {
          setModelsReady(true);
        }
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Camera error: ${errorMessage}`);
      setHasVideoStream(false);
      setIsLoading(false);
    }
  };

  const handleCapture = () => {
    const imageDataURL = captureImage(videoRef, canvasRef);
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      setIsCaptured(true);
      
      // Stop detection loop on capture
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    } else {
      setError("Failed to capture image. Please try again.");
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
              
              {hasVideoStream && !isCaptured && (
                <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none transition-opacity duration-300 ${faceDetected ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="text-white bg-green-600/20 backdrop-blur-sm px-3 py-1.5 rounded-md border border-green-500/30">
                    Face Detected
                  </div>
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
              />
            ) : capturedImage ? (
              <CapturedImage
                capturedImage={capturedImage}
                isLoading={isLoading}
                mode={mode}
                onIdentify={handleIdentify}
                onRegister={handleRegisterFace}
              />
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
};

export default FaceCapture;
