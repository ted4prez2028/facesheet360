
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { 
  Prescription, 
  usePrescriptions, 
  useUpdatePrescriptionStatus 
} from "@/hooks/usePrescriptions";

interface PrescriptionListProps {
  patientId: string;
  onAddNew: () => void;
}

export const PrescriptionList = ({ patientId, onAddNew }: PrescriptionListProps) => {
  const { user } = useAuth();
  const { data: prescriptions = [], isLoading } = usePrescriptions(patientId);
  const { mutate: updateStatus } = useUpdatePrescriptionStatus();
  
  const isDoctor = user?.role === "doctor";
  const isNurse = user?.role === "nurse";
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "prescribed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const handleAdminister = (prescription: Prescription) => {
    if (!user?.id) return;
    
    updateStatus({ 
      id: prescription.id, 
      status: "active", 
      administeredBy: user.id 
    });
  };
  
  const handleComplete = (prescription: Prescription) => {
    updateStatus({ id: prescription.id, status: "completed" });
  };
  
  const handleCancel = (prescription: Prescription) => {
    updateStatus({ id: prescription.id, status: "cancelled" });
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Medications</CardTitle>
        {isDoctor && (
          <Button 
            onClick={onAddNew}
            className="gap-1 bg-health-600 hover:bg-health-700"
            size="sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Prescribe</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading prescriptions...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No medications prescribed yet.
            {isDoctor && (
              <div className="mt-2">
                <Button 
                  onClick={onAddNew} 
                  variant="outline" 
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Prescribe Medication</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-4">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium">{prescription.medication_name}</h3>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {prescription.dosage}, {prescription.frequency.replace(/_/g, ' ')}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Start: {format(new Date(prescription.start_date), "PP")}
                      </span>
                      
                      {prescription.end_date && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          End: {format(new Date(prescription.end_date), "PP")}
                        </span>
                      )}
                      
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Prescribed: {format(new Date(prescription.created_at), "PPp")}
                      </span>
                    </div>
                    
                    {prescription.instructions && (
                      <div className="mt-2 text-sm">
                        <strong>Instructions:</strong> {prescription.instructions}
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons for nurses and doctors */}
                  {(isDoctor || isNurse) && (
                    <div className="flex sm:flex-col justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-800">
                      {prescription.status === "prescribed" && isNurse && (
                        <Button 
                          onClick={() => handleAdminister(prescription)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Administer
                        </Button>
                      )}
                      
                      {prescription.status === "active" && (isDoctor || isNurse) && (
                        <Button 
                          onClick={() => handleComplete(prescription)}
                          size="sm"
                          variant="outline"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      
                      {(prescription.status === "prescribed" || prescription.status === "active") && 
                        (isDoctor || isNurse) && (
                        <Button 
                          onClick={() => handleCancel(prescription)}
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionList;
