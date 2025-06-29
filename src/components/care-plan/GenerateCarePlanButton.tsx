
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, LoaderCircle } from "lucide-react";
import { useCarePlanGenerator } from "@/hooks/useCarePlanGenerator";
import { PatientNotesForCarePlan } from './PatientNotesForCarePlan';

import { Patient } from "@/types";

interface PatientDataForCarePlan extends Patient {
  selectedNotes?: string[];
}

interface GenerateCarePlanButtonProps {
  patientId: string;
  onPlanGenerated: (plan: string) => void;
  patientData: PatientDataForCarePlan;
}

export function GenerateCarePlanButton({ 
  patientId, 
  onPlanGenerated, 
  patientData 
}: GenerateCarePlanButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const { generateCarePlan, isGenerating } = useCarePlanGenerator({ patientId });
  
  const handleGenerateCarePlan = async () => {
    if (!patientData) return;
    
    // Include the selected notes in the patient data
    const enhancedPatientData = {
      ...patientData,
      selectedNotes
    };
    
    generateCarePlan.mutate(enhancedPatientData, {
      onSuccess: (data) => {
        onPlanGenerated(data);
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="gap-1 bg-purple-600 hover:bg-purple-700"
      >
        <Sparkles className="h-4 w-4" />
        <span>Generate AI Care Plan</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate AI Care Plan</DialogTitle>
            <DialogDescription>
              The AI will create a care plan based on the patient's data. You can select specific notes to include in the plan generation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <PatientNotesForCarePlan 
              patientId={patientId} 
              onSelectNotes={setSelectedNotes}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCarePlan}
              disabled={isGenerating || generateCarePlan.isPending}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating || generateCarePlan.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Plan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
