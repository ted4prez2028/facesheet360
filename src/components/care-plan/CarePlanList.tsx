
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles } from "lucide-react";
import { useCarePlans } from "@/hooks/useCarePlans";
import { CarePlanViewer } from "./CarePlanViewer";
import { AICareplanButton } from "./AICareplanButton";
import { Patient } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface CarePlanListProps {
  patient: Patient;
  onAddNew: () => void;
}

export const CarePlanList = ({ patient, onAddNew }: CarePlanListProps) => {
  const { user } = useAuth();
  const { data: carePlans = [], isLoading } = useCarePlans(patient.id);
  
  const isDoctor = user?.role === "doctor";
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Care Plans</CardTitle>
        <div className="flex gap-2">
          {isDoctor && (
            <>
              <AICareplanButton patient={patient} />
              <Button 
                onClick={onAddNew}
                className="gap-1 bg-health-600 hover:bg-health-700"
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Plan</span>
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading care plans...
          </div>
        ) : carePlans.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No care plans available for this patient.
            {isDoctor && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <AICareplanButton patient={patient} />
                <Button 
                  onClick={onAddNew} 
                  variant="outline" 
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Manual Care Plan</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {carePlans.map((carePlan) => (
              <CarePlanViewer key={carePlan.id} carePlan={carePlan} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarePlanList;
