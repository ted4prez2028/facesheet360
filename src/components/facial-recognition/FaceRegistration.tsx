
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import FaceCapture from './FaceCapture';
import { Check, Camera } from 'lucide-react';

interface FaceRegistrationProps {
  patientId: string;
  onComplete?: () => void;
}

const FaceRegistration = ({ patientId, onComplete }: FaceRegistrationProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
    setIsCapturing(false);
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Facial Recognition</CardTitle>
        <CardDescription>
          {isRegistered 
            ? 'Facial data has been registered successfully'
            : 'Register facial data for faster patient identification'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCapturing ? (
          <FaceCapture 
            mode="register"
            userId={patientId}
            onSuccess={handleRegistrationSuccess}
          />
        ) : (
          <div className="flex justify-center">
            {isRegistered ? (
              <Button 
                variant="outline"
                className="gap-2 text-green-600"
                disabled
              >
                <Check className="h-4 w-4" />
                <span>Facial Data Registered</span>
              </Button>
            ) : (
              <Button 
                className="gap-2 bg-health-600 hover:bg-health-700"
                onClick={() => setIsCapturing(true)}
              >
                <Camera className="h-4 w-4" />
                <span>Register Face</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceRegistration;
