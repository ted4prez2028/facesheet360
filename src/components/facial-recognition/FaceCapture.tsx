
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Patient } from '@/types';
import { 
  checkCameraAvailability, 
  initializeCamera, 
  captureImage,
  identifyPatient,
  registerFace
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
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVideoStream, setHasVideoStream] = useState(false);

  useEffect(() => {
    const checkCamera = async () => {
      const hasCamera = await checkCameraAvailability();
      setHasCamera(hasCamera);
      if (!hasCamera) {
        setError("Camera not found. Please connect a camera and try again.");
      }
    };

    checkCamera();
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    const success = await initializeCamera(videoRef);
    setHasVideoStream(success);
    setIsLoading(false);
    
    if (!success) {
      setError("Failed to start camera. Please try again.");
    }
  };

  const handleCapture = () => {
    const imageDataURL = captureImage(videoRef, canvasRef);
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      setIsCaptured(true);
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
            <video ref={videoRef} className="w-full max-w-md rounded-md" />
            <canvas ref={canvasRef} className="hidden" />

            {!isCaptured ? (
              <CameraControls
                isCaptured={isCaptured}
                isLoading={isLoading}
                hasVideoStream={hasVideoStream}
                onStartCamera={startCamera}
                onCapture={handleCapture}
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
