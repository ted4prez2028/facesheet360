
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FaceCaptureErrorProps {
  error: string | null;
}

const FaceCaptureError: React.FC<FaceCaptureErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="text-destructive text-sm flex items-center">
      <AlertCircle className="mr-2 h-4 w-4" />
      {error}
    </div>
  );
};

export default FaceCaptureError;
