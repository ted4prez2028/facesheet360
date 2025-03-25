
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Check, X } from 'lucide-react';
import { recognizeFace, storeFacialData } from '@/lib/mongodb';

interface FaceCaptureProps {
  onSuccess?: (patientData: any) => void;
  mode: 'identify' | 'register';
  userId?: string;
}

const FaceCapture = ({ onSuccess, mode, userId }: FaceCaptureProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);
  
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);
  
  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);
  
  const processImage = useCallback(async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      if (mode === 'identify') {
        // Send captured image for facial recognition
        const data = await recognizeFace(capturedImage);
        
        if (data) {
          toast.success('Patient identified successfully');
          if (onSuccess) onSuccess(data);
        } else {
          toast.error('No match found. Please try again or search manually.');
        }
      } else if (mode === 'register' && userId) {
        // Store facial data for a user
        await storeFacialData(userId, capturedImage);
        toast.success('Facial data registered successfully');
        if (onSuccess) onSuccess({ success: true });
      }
    } catch (error) {
      console.error('Facial recognition error:', error);
      toast.error('Error processing facial data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, mode, userId, onSuccess]);
  
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);
  
  return (
    <div className="space-y-4">
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
        {isStreaming && !capturedImage ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured facial image" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center p-4">
            <Camera className="h-8 w-8 mx-auto mb-2" />
            <p>Camera is initializing...</p>
          </div>
        )}
        
        {/* Hidden canvas for capturing the image */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex gap-2 justify-center">
        {!capturedImage ? (
          <Button
            onClick={captureImage}
            disabled={!isStreaming}
            className="gap-2 bg-health-600 hover:bg-health-700"
          >
            <Camera className="h-4 w-4" />
            <span>Capture Image</span>
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={resetCapture} className="gap-2">
              <X className="h-4 w-4" />
              <span>Retake</span>
            </Button>
            <Button 
              onClick={processImage} 
              disabled={isProcessing}
              className="gap-2 bg-health-600 hover:bg-health-700"
            >
              <Check className="h-4 w-4" />
              <span>
                {isProcessing 
                  ? 'Processing...' 
                  : mode === 'identify' 
                    ? 'Identify Patient' 
                    : 'Register Face'
                }
              </span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
