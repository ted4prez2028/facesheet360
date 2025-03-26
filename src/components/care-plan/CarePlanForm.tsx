
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddCarePlan } from "@/hooks/useCarePlans";
import { useAuth } from "@/context/AuthContext";

interface CarePlanFormProps {
  patientId: string;
  onClose: () => void;
}

export const CarePlanForm = ({ patientId, onClose }: CarePlanFormProps) => {
  const { user } = useAuth();
  const { mutate: addCarePlan, isPending } = useAddCarePlan();
  
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    addCarePlan({
      patient_id: patientId,
      provider_id: user.id,
      content,
      is_ai_generated: false,
      status: "draft"
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Care Plan</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="content">Care Plan Details</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter care plan details, goals, and recommendations..."
              rows={15}
              required
              className="min-h-[300px]"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-health-600 hover:bg-health-700"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Care Plan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CarePlanForm;
