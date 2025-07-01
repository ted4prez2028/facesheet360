
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Prescription } from "@/types";
import { useAdministerPrescription } from "@/hooks/usePrescriptions";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionCardProps {
  prescription: Prescription;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription }) => {
  const { toast } = useToast();
  const administerMutation = useAdministerPrescription();

  const patientName = prescription.patients 
    ? `${prescription.patients.first_name} ${prescription.patients.last_name}`
    : "Unknown Patient";
  
  const medicalRecordNumber = prescription.patients?.medical_record_number || "N/A";

  const handleAdminister = async () => {
    try {
      await administerMutation.mutateAsync(prescription.id);
      toast({
        title: "Success",
        description: "Medication administered successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to administer medication",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "prescribed":
        return <Badge variant="outline" className="bg-blue-50">Prescribed</Badge>;
      case "administered":
        return <Badge variant="outline" className="bg-green-50">Administered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {prescription.medication_name}
          </CardTitle>
          {getStatusBadge(prescription.status)}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{patientName} (MRN: {medicalRecordNumber})</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Dosage:</span>
            <p className="text-muted-foreground">{prescription.dosage}</p>
          </div>
          <div>
            <span className="font-medium">Frequency:</span>
            <p className="text-muted-foreground">{prescription.frequency}</p>
          </div>
        </div>

        {prescription.instructions && (
          <div className="text-sm">
            <span className="font-medium">Instructions:</span>
            <p className="text-muted-foreground mt-1">{prescription.instructions}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Prescribed {formatDistanceToNow(new Date(prescription.created_at), { addSuffix: true })}
          </span>
        </div>

        {prescription.status === "prescribed" && (
          <div className="pt-2">
            <Button 
              onClick={handleAdminister}
              disabled={administerMutation.isPending}
              className="w-full"
              size="sm"
            >
              {administerMutation.isPending ? "Administering..." : "Mark as Administered"}
            </Button>
          </div>
        )}

        {prescription.administered_at && (
          <div className="text-sm text-green-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>
              Administered {formatDistanceToNow(new Date(prescription.administered_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;
