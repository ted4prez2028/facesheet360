
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface CapturedImageProps {
  capturedImage: string;
  isLoading: boolean;
  mode: 'identify' | 'register';
  faceConfidence?: number;
  onIdentify: () => void;
  onRegister: () => void;
  onRetake?: () => void;
}

const CapturedImage: React.FC<CapturedImageProps> = ({
  capturedImage,
  isLoading,
  mode,
  faceConfidence = 0,
  onIdentify,
  onRegister,
  onRetake
}) => {
  const confidencePercent = Math.round(faceConfidence);
  const minConfidence = mode === 'register' ? 75 : 60;
  const isQualitySufficient = confidencePercent >= minConfidence;
  
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="relative w-full max-w-md">
        <img
          src={capturedImage}
          alt="Captured face"
          className="w-full rounded-md border-2 border-border"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-md flex items-center justify-center">
            <div className="text-white text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm font-medium">
                {mode === 'identify' ? 'Identifying patient...' : 'Processing facial data...'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {mode === 'register' && !isLoading && faceConfidence > 0 && (
        <div className="w-full max-w-md space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Image Quality</span>
              <span className={`font-bold ${isQualitySufficient ? 'text-green-600' : 'text-amber-600'}`}>
                {confidencePercent}%
              </span>
            </div>
            <Progress 
              value={confidencePercent} 
              className="h-2"
            />
          </div>
          
          {isQualitySufficient ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700 dark:text-green-400">
                Excellent quality! This image meets the {minConfidence}% minimum threshold and is ready for registration.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                Quality below {minConfidence}% threshold. Consider retaking for better results with good lighting and clear face visibility.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      <div className="flex gap-2 w-full max-w-md">
        {onRetake && (
          <Button
            onClick={onRetake}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake
          </Button>
        )}
        
        {mode === 'identify' ? (
          <Button
            onClick={onIdentify}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Identifying
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Identify Patient
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onRegister}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering
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
    </div>
  );
};

export default CapturedImage;
