
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FaceCaptureErrorProps {
  error: string | null;
}

const FaceCaptureError: React.FC<FaceCaptureErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="text-red-500 text-sm">
      <AlertCircle className="mr-2 inline-block h-4 w-4 align-middle" />
      {error}
    </div>
  );
};

export default FaceCaptureError;
