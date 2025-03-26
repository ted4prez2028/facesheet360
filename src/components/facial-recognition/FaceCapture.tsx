
import React, { useState, useRef, useEffect } from 'react';
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
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

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
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    const success = await initializeCamera(videoRef);
    setHasVideoStream(success);
    setIsLoading(false);
    
    if (!success) {
      setError("Failed to start camera. Please try again.");
    } else {
      // Start face detection loop
      startFaceDetection();
    }
  };
  
  const startFaceDetection = () => {
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
        setAnimationFrameId(id);
      }
    };
    
    detectFacesLoop();
  };

  const handleCapture = () => {
    const imageDataURL = captureImage(videoRef, canvasRef);
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      setIsCaptured(true);
      
      // Stop detection loop on capture
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
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
              <video ref={videoRef} className="w-full rounded-md" />
              <canvas 
                ref={faceDetectionCanvasRef} 
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {hasVideoStream && !isCaptured && (
                <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none transition-opacity duration-300 ${faceDetected ? 'opacity-100' : 'opacity-0'}`}>
                  <div className={`text-white bg-green-500 bg-opacity-20 px-2 py-1 rounded-md ${faceDetected ? 'opacity-100' : 'opacity-0'}`}>
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
