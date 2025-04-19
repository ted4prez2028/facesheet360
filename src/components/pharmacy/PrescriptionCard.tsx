
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Prescription } from "@/types";
import { CheckCircle, AlertCircle } from "lucide-react";

interface PrescriptionCardProps {
  prescription: Prescription;
  onFill: (id: string) => void;
  isPending?: boolean;
}

export const PrescriptionCard = ({ prescription, onFill, isPending = false }: PrescriptionCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {prescription.patients ? 
                `${prescription.patients.first_name} ${prescription.patients.last_name}` : 
                "Unknown Patient"}
            </p>
          </div>
          <Badge className={isPending ? 
            "bg-amber-100 text-amber-800 hover:bg-amber-100" : 
            "bg-green-100 text-green-800 hover:bg-green-100"
          }>
            {isPending ? "Pending" : "Filled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Dosage:</span>
            <span>{prescription.dosage}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Frequency:</span>
            <span>{prescription.frequency}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Prescribed by:</span>
            <span>{prescription.providers?.name || "Unknown"}</span>
          </div>
          {prescription.instructions && (
            <>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Instructions:</span>
              </div>
              <div className="text-gray-700 bg-gray-50 p-2 rounded text-xs">
                {prescription.instructions}
              </div>
            </>
          )}
        </div>
      </CardContent>
      {isPending && (
        <CardFooter className="pt-2">
          <Button 
            className="w-full bg-health-600 hover:bg-health-700 text-white"
            onClick={() => onFill(prescription.id)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Fill Prescription
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
