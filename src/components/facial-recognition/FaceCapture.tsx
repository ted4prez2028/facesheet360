
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Check, X } from 'lucide-react';
import { identifyPatientByFace, registerFacialData, loadFaceDetectionModels } from '@/lib/facialRecognition';
import * as faceapi from 'face-api.js';

interface FaceCaptureProps {
  onSuccess?: (patientData: any) => void;
  mode: 'identify' | 'register';
  userId?: string;
}

const FaceCapture = ({ onSuccess, mode, userId }: FaceCaptureProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetections, setFaceDetections] = useState<faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
  }, faceapi.FaceLandmarks68>[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceOverlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Load face detection models on component mount
  useEffect(() => {
    loadFaceDetectionModels().catch(error => {
      console.error('Failed to load face detection models:', error);
    });
  }, []);
  
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
    setFaceDetections([]);
    startCamera();
  }, [startCamera]);
  
  const processImage = useCallback(async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      if (mode === 'identify') {
        // Send captured image for facial recognition
        const data = await identifyPatientByFace(capturedImage);
        
        if (data) {
          toast.success('Patient identified successfully');
          if (onSuccess) onSuccess(data);
        } else {
          toast.error('No match found. Please try again or search manually.');
        }
      } else if (mode === 'register' && userId) {
        // Store facial data for a user
        await registerFacialData(userId, capturedImage);
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
  
  // Real-time face detection
  useEffect(() => {
    let animationId: number;
    let intervalId: NodeJS.Timeout;
    
    const detectFaces = async () => {
      if (!isStreaming || !videoRef.current || !faceOverlayRef.current || !faceapi.nets.ssdMobilenetv1.isLoaded) {
        return;
      }
      
      const video = videoRef.current;
      const canvas = faceOverlayRef.current;
      
      // Set canvas dimensions to match video
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      
      // Detect faces
      const detections = await faceapi.detectAllFaces(video)
        .withFaceLandmarks();
      
      // Update state with detections
      setFaceDetections(detections);
      
      // Draw detections on canvas
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw face boxes
        resizedDetections.forEach(detection => {
          const box = detection.detection.box;
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#4CAF50';
          ctx.rect(box.x, box.y, box.width, box.height);
          ctx.stroke();
          
          // Add text label above box
          ctx.font = '16px Arial';
          ctx.fillStyle = '#4CAF50';
          ctx.fillText('Face Detected', box.x, box.y - 10);
        });
      }
      
      // Continue detection loop
      animationId = requestAnimationFrame(detectFaces);
    };
    
    if (isStreaming) {
      // Start face detection after a short delay to make sure video is playing
      intervalId = setTimeout(() => {
        animationId = requestAnimationFrame(detectFaces);
      }, 1000);
    }
    
    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(intervalId);
    };
  }, [isStreaming]);
  
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
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <canvas 
              ref={faceOverlayRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </>
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
            disabled={!isStreaming || faceDetections.length === 0}
            className="gap-2 bg-health-600 hover:bg-health-700"
          >
            <Camera className="h-4 w-4" />
            <span>
              {faceDetections.length === 0 ? "No Face Detected" : "Capture Image"}
            </span>
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
