
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="flex flex-col items-center space-y-4">
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
      
      {mode === 'register' && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Ensure good lighting and a clear view of the face for best results. Minimum 75% confidence required.
          </AlertDescription>
        </Alert>
      )}
      
      {mode === 'identify' ? (
        <Button
          onClick={onIdentify}
          disabled={isLoading}
          className="w-full max-w-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Identifying Patient
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
          className="w-full max-w-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering Face
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
