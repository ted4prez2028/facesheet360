
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Camera } from 'lucide-react';

interface CameraControlsProps {
  isCaptured: boolean;
  isLoading: boolean;
  hasVideoStream: boolean;
  onStartCamera: () => void;
  onCapture: () => void;
  isFaceDetected?: boolean;
  countdown?: number | null;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isCaptured,
  isLoading,
  hasVideoStream,
  onStartCamera,
  onCapture,
  isFaceDetected = false,
  countdown = null
}) => {
  return (
    <>
      {!hasVideoStream && !isCaptured && (
        <Button
          onClick={onStartCamera}
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

      {hasVideoStream && !isCaptured && (
        <Button
          onClick={onCapture}
          disabled={isLoading || isCaptured || countdown !== null}
          className={`w-full max-w-md transition-colors ${
            isFaceDetected && countdown === null ? 'bg-green-600 hover:bg-green-700 text-white' : ''
          }`}
          variant={isFaceDetected && countdown === null ? 'default' : 'secondary'}
        >
          <Camera className="mr-2 h-4 w-4" />
          {countdown !== null 
            ? `Capturing in ${countdown}...` 
            : isFaceDetected 
              ? 'Capture Face' 
              : 'Capture Image'}
        </Button>
      )}
    </>
  );
};

export default CameraControls;
