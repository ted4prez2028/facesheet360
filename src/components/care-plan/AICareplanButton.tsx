
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useGenerateAICarePlan } from "@/hooks/useCarePlans";
import { Patient } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AICareplanButtonProps {
  patient: Patient;
  className?: string;
}

export const AICareplanButton = ({ patient, className }: AICareplanButtonProps) => {
  const { user } = useAuth();
  const { mutate: generateCarePlan, isPending, isError, error } = useGenerateAICarePlan();
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleGenerateCarePlan = () => {
    // Reset error state on new attempt
    setHasConfirmed(false);
    
    if (!user) {
      toast.error("You must be logged in to generate a care plan");
      return;
    }
    
    if (!hasConfirmed) {
      toast("This will generate a care plan using AI based on patient data", {
        description: "Click again to confirm",
        action: {
          label: "Confirm",
          onClick: () => {
            setHasConfirmed(true);
            generateCarePlan(patient);
          }
        }
      });
      return;
    }
    
    generateCarePlan(patient, {
      onError: (error) => {
        console.error("Error generating care plan:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        
        if (errorMessage.includes("API key")) {
          toast.error("AI service configuration error", {
            description: "Please contact your administrator to configure the OpenAI API key",
            duration: 5000,
          });
        } else {
          toast.error("Failed to generate AI care plan", {
            description: errorMessage,
            duration: 5000,
          });
        }
      }
    });
  };

  // If there was a previous error, show a different button state
  if (isError) {
    return (
      <Button
        onClick={handleGenerateCarePlan}
        variant="outline"
        className={`bg-red-50 hover:bg-red-100 text-red-700 ${className}`}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Retry AI Care Plan
      </Button>
    );
  }

  return (
    <Button
      onClick={handleGenerateCarePlan}
      variant="default"
      className={`bg-gradient-to-r from-health-600 to-health-700 hover:from-health-700 hover:to-health-800 ${className}`}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      {isPending ? "Generating..." : "Generate AI Care Plan"}
    </Button>
  );
};

export default AICareplanButton;
