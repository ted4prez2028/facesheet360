
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import FaceCapture from './FaceCapture';
import { useNavigate } from 'react-router-dom';

interface FaceIdentificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FaceIdentificationDialog = ({ open, onOpenChange }: FaceIdentificationDialogProps) => {
  const navigate = useNavigate();
  const [identifiedPatient, setIdentifiedPatient] = useState<any>(null);
  
  const handlePatientIdentified = (patientData: any) => {
    setIdentifiedPatient(patientData);
    
    // Navigate to the patient's chart after a short delay
    setTimeout(() => {
      onOpenChange(false);
      navigate(`/charting?patientId=${patientData._id}`);
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Patient Identification</DialogTitle>
          <DialogDescription>
            {identifiedPatient 
              ? `Patient identified: ${identifiedPatient.name}`
              : 'Position the patient's face in the frame to identify them using facial recognition.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <FaceCapture 
          mode="identify"
          onSuccess={handlePatientIdentified}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FaceIdentificationDialog;
