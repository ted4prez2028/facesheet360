
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';

interface CapturedImageProps {
  capturedImage: string;
  isLoading: boolean;
  mode: 'identify' | 'register';
  onIdentify: () => void;
  onRegister: () => void;
}

const CapturedImage: React.FC<CapturedImageProps> = ({
  capturedImage,
  isLoading,
  mode,
  onIdentify,
  onRegister
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <img
        src={capturedImage}
        alt="Captured"
        className="w-full max-w-md rounded-md"
      />
      {mode === 'identify' ? (
        <Button
          onClick={onIdentify}
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
          onClick={onRegister}
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
  );
};

export default CapturedImage;
