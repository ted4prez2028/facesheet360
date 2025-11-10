
import React from "react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import FaceCapture from "../facial-recognition/FaceCapture";

interface PatientFacialCaptureProps {
  facialData: string | null;
  onCapture: (data: string) => void;
}

const PatientFacialCapture: React.FC<PatientFacialCaptureProps> = ({
  facialData,
  onCapture,
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Facial Recognition</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Capture the patient's face to enable identification by facial recognition.
        </p>
        
        {!facialData && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Tips for best results:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Ensure good lighting on the face</li>
                <li>Look directly at the camera</li>
                <li>Remove glasses if possible</li>
                <li>Maintain neutral expression</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <FaceCapture mode="register" onCapture={onCapture} />
        
        {facialData && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-700 dark:text-green-400">
              Facial data captured successfully! High-quality image registered.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PatientFacialCapture;
