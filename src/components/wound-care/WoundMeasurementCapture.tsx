import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Check, X, Ruler, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MeasurementData {
  width: number;
  height: number;
  depth?: number;
  unit: 'cm' | 'mm';
  referenceType: 'coin' | 'ruler' | 'custom';
  referenceSize: number;
}

interface WoundMeasurementCaptureProps {
  onCapture: (imageDataUrl: string, measurements: MeasurementData) => void;
  onCancel: () => void;
}

const REFERENCE_SIZES = {
  'quarter': 24.26, // mm
  'dime': 17.91,
  'penny': 19.05,
  'euro_1': 23.25,
  'euro_2': 25.75,
};

export const WoundMeasurementCapture: React.FC<WoundMeasurementCaptureProps> = ({
  onCapture,
  onCancel,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [measurementMode, setMeasurementMode] = useState<'reference' | 'measure'>('reference');
  const [referenceType, setReferenceType] = useState<string>('quarter');
  const [customReferenceSize, setCustomReferenceSize] = useState<number>(25);
  const [referencePoints, setReferencePoints] = useState<{ x: number; y: number }[]>([]);
  const [measurementPoints, setMeasurementPoints] = useState<{ x: number; y: number }[]>([]);
  const [pixelsPerMm, setPixelsPerMm] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  useEffect(() => {
    if (capturedImage && overlayCanvasRef.current) {
      drawMeasurementOverlay();
    }
  }, [referencePoints, measurementPoints, capturedImage]);

  const startCamera = async () => {
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      onCancel();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!capturedImage) return;

    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (measurementMode === 'reference') {
      if (referencePoints.length < 2) {
        setReferencePoints([...referencePoints, { x, y }]);
        if (referencePoints.length === 1) {
          // Calculate scale
          const refSize = referenceType === 'custom' 
            ? customReferenceSize 
            : REFERENCE_SIZES[referenceType as keyof typeof REFERENCE_SIZES];
          
          const pixelDistance = Math.sqrt(
            Math.pow(x - referencePoints[0].x, 2) + 
            Math.pow(y - referencePoints[0].y, 2)
          );
          
          setPixelsPerMm(pixelDistance / refSize);
          toast.success('Reference scale set! Now measure the wound.');
          setMeasurementMode('measure');
        }
      }
    } else {
      if (measurementPoints.length < 4) {
        setMeasurementPoints([...measurementPoints, { x, y }]);
      }
    }
  };

  const drawMeasurementOverlay = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw reference points
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 3;

    referencePoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      if (index > 0) {
        ctx.beginPath();
        ctx.moveTo(referencePoints[index - 1].x, referencePoints[index - 1].y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    });

    // Draw measurement points
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b981';

    measurementPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      if (index > 0) {
        ctx.beginPath();
        ctx.moveTo(measurementPoints[index - 1].x, measurementPoints[index - 1].y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        
        // Draw measurement label
        const distance = Math.sqrt(
          Math.pow(point.x - measurementPoints[index - 1].x, 2) + 
          Math.pow(point.y - measurementPoints[index - 1].y, 2)
        );
        const mmDistance = distance / pixelsPerMm;
        const midX = (point.x + measurementPoints[index - 1].x) / 2;
        const midY = (point.y + measurementPoints[index - 1].y) / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX - 30, midY - 15, 60, 30);
        ctx.fillStyle = '#10b981';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${mmDistance.toFixed(1)}mm`, midX, midY + 5);
      }
    });

    // Close the measurement polygon
    if (measurementPoints.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(measurementPoints[measurementPoints.length - 1].x, measurementPoints[measurementPoints.length - 1].y);
      ctx.lineTo(measurementPoints[0].x, measurementPoints[0].y);
      ctx.stroke();
    }
  };

  const calculateMeasurements = (): MeasurementData => {
    if (measurementPoints.length < 3) {
      throw new Error('Need at least 3 measurement points');
    }

    // Calculate bounding box
    const xCoords = measurementPoints.map(p => p.x);
    const yCoords = measurementPoints.map(p => p.y);
    
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    
    const widthPx = maxX - minX;
    const heightPx = maxY - minY;
    
    const widthMm = widthPx / pixelsPerMm;
    const heightMm = heightPx / pixelsPerMm;

    return {
      width: Math.round(widthMm * 10) / 10,
      height: Math.round(heightMm * 10) / 10,
      unit: 'mm',
      referenceType: referenceType === 'custom' ? 'custom' : referenceType as 'coin' | 'ruler',
      referenceSize: referenceType === 'custom' 
        ? customReferenceSize 
        : REFERENCE_SIZES[referenceType as keyof typeof REFERENCE_SIZES]
    };
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    try {
      const measurements = calculateMeasurements();
      onCapture(capturedImage, measurements);
      stopCamera();
    } catch (error) {
      toast.error('Please complete the measurement first');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setReferencePoints([]);
    setMeasurementPoints([]);
    setPixelsPerMm(0);
    setMeasurementMode('reference');
    startCamera();
  };

  const handleReset = () => {
    setReferencePoints([]);
    setMeasurementPoints([]);
    setPixelsPerMm(0);
    setMeasurementMode('reference');
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="space-y-4">
      {!capturedImage && (
        <div className="space-y-2">
          <Label>Reference Object</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={referenceType} onValueChange={setReferenceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarter">US Quarter (24.3mm)</SelectItem>
                <SelectItem value="dime">US Dime (17.9mm)</SelectItem>
                <SelectItem value="penny">US Penny (19.1mm)</SelectItem>
                <SelectItem value="euro_1">1 Euro (23.3mm)</SelectItem>
                <SelectItem value="euro_2">2 Euro (25.8mm)</SelectItem>
                <SelectItem value="custom">Custom Size</SelectItem>
              </SelectContent>
            </Select>
            
            {referenceType === 'custom' && (
              <Input
                type="number"
                placeholder="Size (mm)"
                value={customReferenceSize}
                onChange={(e) => setCustomReferenceSize(Number(e.target.value))}
              />
            )}
          </div>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Captured wound"
              className="w-full h-full object-contain"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              width={canvasRef.current?.width || 1920}
              height={canvasRef.current?.height || 1080}
              onClick={handleImageClick}
            />
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {/* Instructions overlay */}
        {capturedImage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
            {measurementMode === 'reference' ? (
              <>
                <Circle className="h-4 w-4 inline mr-2" />
                Step 1: Click two points across your reference object ({referenceType === 'custom' ? `${customReferenceSize}mm` : 'coin'})
              </>
            ) : (
              <>
                <Ruler className="h-4 w-4 inline mr-2" />
                Step 2: Click points around the wound perimeter (min 3 points)
              </>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {capturedImage && (
        <div className="text-sm text-muted-foreground text-center">
          {measurementMode === 'reference' 
            ? `Reference points: ${referencePoints.length}/2` 
            : `Measurement points: ${measurementPoints.length} (min 3)`}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-2">
        {capturedImage ? (
          <>
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
            >
              Reset Points
            </Button>
            <Button
              variant="outline"
              onClick={handleRetake}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={measurementPoints.length < 3 || pixelsPerMm === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Measurement
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={toggleCamera}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip
            </Button>
            <Button
              onClick={handleCapture}
              disabled={!isCameraActive}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
