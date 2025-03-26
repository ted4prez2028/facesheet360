
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import FaceCapture from './FaceCapture';
import { Patient } from '@/types';

const FaceIdentificationDialog = ({ 
  isOpen, 
  onClose, 
  onIdentificationSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onIdentificationSuccess: (patientId: string) => void 
}) => {
  const handleIdentificationSuccess = (patientData: Patient) => {
    if (patientData && patientData.id) {
      onIdentificationSuccess(patientData.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Patient Identification</DialogTitle>
          <DialogDescription>
            Use facial recognition to identify a patient
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FaceCapture 
            mode="identify" 
            onSuccess={handleIdentificationSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceIdentificationDialog;
