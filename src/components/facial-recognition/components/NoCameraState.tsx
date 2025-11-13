
import React from 'react';
import { AlertCircle } from 'lucide-react';

const NoCameraState: React.FC = () => {
  return (
    <div className="text-muted-foreground">
      <AlertCircle className="mr-2 inline-block h-4 w-4 align-middle" />
      No camera found.
    </div>
  );
};

export default NoCameraState;
