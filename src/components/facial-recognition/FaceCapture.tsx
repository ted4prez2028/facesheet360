import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { detectFaces, matchPatientByFace } from '@/lib/facialRecognition';
import { getPatientByFacialData } from '@/lib/supabaseApi';
import { Patient } from '@/types';
import { Loader2, Camera, Check, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCamera(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setHasCamera(false);
        setError("Camera not found. Please connect a camera and try again.");
        toast.error("Camera not found. Please connect a camera and try again.");
      }
    };

    checkCameraAvailability();
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error("Autoplay error:", err);
            setError("Failed to start camera. Autoplay might be disabled.");
            toast.error("Failed to start camera. Autoplay might be disabled.");
          });
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(err.message || "Failed to access camera.");
      toast.error(err.message || "Failed to access camera.");
      setIsLoading(false);
    }
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataURL);
    setIsCaptured(true);
  };

  const identify = async () => {
    if (!capturedImage) {
      setError("No image captured. Please capture an image first.");
      toast.error("No image captured. Please capture an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const faceData = await detectFaces(capturedImage);
      if (!faceData) {
        setError("No face detected. Please try again.");
        toast.error("No face detected. Please try again.");
        setIsLoading(false);
        return;
      }

      const patients = await getPatientByFacialData();
      if (!patients || patients.length === 0) {
        setError("No patients with facial data found.");
        toast.error("No patients with facial data found.");
        setIsLoading(false);
        return;
      }

      const matchedPatient = await matchPatientByFace(faceData, patients);
      if (matchedPatient) {
        toast.success(`Patient identified: ${matchedPatient.first_name} ${matchedPatient.last_name}`);
        onSuccess?.(matchedPatient);
      } else {
        setError("No matching patient found.");
        toast.error("No matching patient found.");
      }
    } catch (err: any) {
      console.error("Facial recognition error:", err);
      setError(err.message || "Failed to identify patient.");
      toast.error(err.message || "Failed to identify patient.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerFace = async () => {
    if (!capturedImage) {
      setError("No image captured. Please capture an image first.");
      toast.error("No image captured. Please capture an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const faceData = await detectFaces(capturedImage);
      if (!faceData) {
        setError("No face detected. Please try again.");
        toast.error("No face detected. Please try again.");
        setIsLoading(false);
        return;
      }

      // Convert faceData to string
      const faceDataString = JSON.stringify(faceData);

      // Call the onFaceCapture prop with the face data
      onCapture?.(faceDataString);

      toast.success("Face data captured successfully.");
      onSuccess?.({ id: patientId || userId! } as Patient);
    } catch (err: any) {
      console.error("Facial recognition error:", err);
      setError(err.message || "Failed to register face.");
      toast.error(err.message || "Failed to register face.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        {error && (
          <div className="text-red-500 text-sm">
            <AlertCircle className="mr-2 inline-block h-4 w-4 align-middle" />
            {error}
          </div>
        )}

        {!hasCamera ? (
          <div className="text-muted-foreground">
            <AlertCircle className="mr-2 inline-block h-4 w-4 align-middle" />
            No camera found.
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full max-w-md rounded-md" />
            <canvas ref={canvasRef} className="hidden" />

            {!isCaptured && (
              <Button
                onClick={startCamera}
                disabled={isLoading || isCaptured}
                className="w-full max-w-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading ...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </>
                )}
              </Button>
            )}

            {videoRef.current?.srcObject && !isCaptured && (
              <Button
                onClick={capture}
                disabled={isLoading || isCaptured}
                className="w-full max-w-md"
              >
                Capture
              </Button>
            )}

            {isCaptured && capturedImage && (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full max-w-md rounded-md"
                />
                {mode === 'identify' ? (
                  <Button
                    onClick={identify}
                    disabled={isLoading}
                    className="w-full max-w-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Identifying ...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Identify
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={registerFace}
                    disabled={isLoading}
                    className="w-full max-w-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering ...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Register Face
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default FaceCapture;
