
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Camera } from 'lucide-react';

interface CameraControlsProps {
  isCaptured: boolean;
  isLoading: boolean;
  hasVideoStream: boolean;
  onStartCamera: () => void;
  onCapture: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isCaptured,
  isLoading,
  hasVideoStream,
  onStartCamera,
  onCapture
}) => {
  return (
    <>
      {!isCaptured && (
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
          disabled={isLoading || isCaptured}
          className="w-full max-w-md"
        >
          Capture
        </Button>
      )}
    </>
  );
};

export default CameraControls;
