
import React from "react";
import { Label } from "@/components/ui/label";
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
        <FaceCapture mode="register" onCapture={onCapture} />
        {facialData && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Facial data captured successfully
          </p>
        )}
      </div>
    </div>
  );
};

export default PatientFacialCapture;
