
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { recognizeFace } from '@/lib/mongodb';
import { toast } from 'sonner';

const FaceIdentificationDialog = ({ 
  isOpen, 
  onClose, 
  onIdentificationSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onIdentificationSuccess: (patientId: string) => void 
}) => {
  const [faceData, setFaceData] = useState<string | null>(null);

  const handleFaceRecognition = async () => {
    if (!faceData) {
      toast.error('No face data captured');
      return;
    }

    try {
      const result = await recognizeFace(faceData);
      if (result.patientId) {
        onIdentificationSuccess(result.patientId);
        toast.success('Patient identified successfully');
      } else {
        toast.error('No matching patient found');
      }
    } catch (error) {
      console.error('Face recognition error', error);
      toast.error('Error during face recognition');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Face Identification</DialogTitle>
          <DialogDescription>
            Identify a patient using facial recognition
          </DialogDescription>
        </DialogHeader>
        {/* Future implementation for face capture */}
        <div className="space-y-4">
          <Button onClick={handleFaceRecognition}>
            Identify Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceIdentificationDialog;
