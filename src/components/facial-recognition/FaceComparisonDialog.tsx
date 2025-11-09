import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types';
import { Camera, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import * as faceapi from 'face-api.js';
import { toast } from 'sonner';

interface FaceComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

const FaceComparisonDialog: React.FC<FaceComparisonDialogProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [comparisonImage, setComparisonImage] = useState<string | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStoredImage = () => {
    if (!patient.facial_data) return null;
    try {
      const parsed = JSON.parse(patient.facial_data);
      return parsed.image || null;
    } catch (err) {
      console.error('Error parsing facial data:', err);
      return null;
    }
  };

  const getStoredDescriptor = () => {
    if (!patient.facial_data) return null;
    try {
      const parsed = JSON.parse(patient.facial_data);
      return parsed.descriptor || null;
    } catch (err) {
      console.error('Error parsing facial data:', err);
      return null;
    }
  };

  const getTimestamp = () => {
    if (!patient.facial_data) return null;
    try {
      const parsed = JSON.parse(patient.facial_data);
      return parsed.timestamp ? new Date(parsed.timestamp) : null;
    } catch (err) {
      console.error('Error parsing facial data:', err);
      return null;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      setComparisonImage(imageDataUrl);
      await compareImages(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const compareImages = async (newImageUrl: string) => {
    setIsComparing(true);
    try {
      // Load stored descriptor
      const storedDescriptor = getStoredDescriptor();
      if (!storedDescriptor) {
        toast.error('No stored facial data found for comparison');
        return;
      }

      // Create image element from new image
      const img = new Image();
      img.src = newImageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Detect face in new image
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected in uploaded image');
        setSimilarityScore(null);
        return;
      }

      const newDescriptor = Array.from(detection.descriptor);

      // Calculate Euclidean distance
      const distance = Math.sqrt(
        newDescriptor.reduce((sum, val, i) => {
          const diff = val - storedDescriptor[i];
          return sum + diff * diff;
        }, 0)
      );

      // Convert distance to similarity percentage (lower distance = higher similarity)
      // Distance typically ranges from 0 (identical) to ~1.2 (very different)
      const MATCH_THRESHOLD = 0.6;
      const similarity = Math.max(0, Math.min(100, ((1 - (distance / MATCH_THRESHOLD)) * 100)));
      
      setSimilarityScore(Math.round(similarity));
      
      if (similarity >= 70) {
        toast.success(`High match! ${Math.round(similarity)}% similarity`);
      } else if (similarity >= 50) {
        toast.info(`Moderate match: ${Math.round(similarity)}% similarity`);
      } else {
        toast.warning(`Low match: ${Math.round(similarity)}% similarity`);
      }
    } catch (err) {
      console.error('Error comparing faces:', err);
      toast.error('Failed to compare faces. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setComparisonImage(null);
    setSimilarityScore(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const storedImage = getStoredImage();
  const timestamp = getTimestamp();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Face Comparison - {patient.first_name} {patient.last_name}
          </DialogTitle>
          <DialogDescription>
            Compare a new photo with the stored facial recognition data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="font-medium">
                {patient.first_name} {patient.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                DOB: {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
              </p>
              {timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Captured: {format(timestamp, 'MMM dd, yyyy HH:mm')}
                </p>
              )}
            </div>
            {similarityScore !== null && (
              <Badge
                className={`text-lg px-4 py-2 ${
                  similarityScore >= 70
                    ? 'bg-green-600'
                    : similarityScore >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
              >
                {similarityScore}% Match
              </Badge>
            )}
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stored Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Stored Photo</h3>
                <Badge variant="secondary">Database</Badge>
              </div>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
                {storedImage ? (
                  <img
                    src={storedImage}
                    alt="Stored facial data"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Comparison Photo</h3>
                {comparisonImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/50 bg-muted relative">
                {comparisonImage ? (
                  <>
                    <img
                      src={comparisonImage}
                      alt="Comparison"
                      className="w-full h-full object-cover"
                    />
                    {isComparing && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm">Analyzing faces...</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center px-4">
                      <p className="text-sm text-muted-foreground">
                        Upload a photo to compare
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similarity Details */}
          {similarityScore !== null && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Analysis Results</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Similarity Score:</span>
                  <span className="font-medium">{similarityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Quality:</span>
                  <span className={`font-medium ${
                    similarityScore >= 70
                      ? 'text-green-600'
                      : similarityScore >= 50
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {similarityScore >= 70
                      ? 'High - Likely Same Person'
                      : similarityScore >= 50
                      ? 'Moderate - Possible Match'
                      : 'Low - Different Person'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommendation:</span>
                  <span className="font-medium">
                    {similarityScore >= 70
                      ? 'Proceed with confidence'
                      : similarityScore >= 50
                      ? 'Additional verification suggested'
                      : 'Manual verification required'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!comparisonImage && (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceComparisonDialog;
