
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface GenerateCarePlanButtonProps {
  patientId: string;
  onPlanGenerated: (carePlan: string) => void;
  patientData: any;
}

export function GenerateCarePlanButton({ patientId, onPlanGenerated, patientData }: GenerateCarePlanButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCarePlan = async () => {
    if (!patientId || !patientData) {
      toast({
        title: "Missing patient data",
        description: "Complete patient information is required to generate a care plan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('generate-care-plan', {
        body: { patientData }
      });

      if (error) throw error;
      
      if (data && data.carePlan) {
        onPlanGenerated(data.carePlan);
        toast({
          title: "Care plan generated",
          description: "AI has created a personalized care plan based on patient data."
        });
      } else {
        throw new Error("Failed to generate care plan - no data returned");
      }
    } catch (error) {
      console.error('Error generating care plan:', error);
      toast({
        title: "Failed to generate care plan",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="gap-2 w-full" 
      onClick={generateCarePlan}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>Generating Care Plan...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          <span>Generate AI Care Plan</span>
        </>
      )}
    </Button>
  );
}
