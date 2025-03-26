
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
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isCaptured,
  isLoading,
  hasVideoStream,
  onStartCamera,
  onCapture,
  isFaceDetected = false
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
          disabled={isLoading || isCaptured || !isFaceDetected}
          className={`w-full max-w-md transition-colors ${
            isFaceDetected ? 'bg-green-500 hover:bg-green-600' : 'bg-muted'
          }`}
        >
          {isFaceDetected ? 'Capture Face' : 'Waiting for face...'}
        </Button>
      )}
    </>
  );
};

export default CameraControls;
