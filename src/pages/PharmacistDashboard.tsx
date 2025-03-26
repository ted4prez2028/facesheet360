
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Prescription } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pill, CheckCircle, Clock, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUpdatePrescriptionStatus } from "@/hooks/usePrescriptions";
import { useAuth } from "@/context/AuthContext";

interface PrescriptionWithRelations extends Prescription {
  patients: { first_name: string; last_name: string } | null;
  providers: { name: string } | null;
}

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate: updatePrescriptionStatus } = useUpdatePrescriptionStatus();
  
  // Fetch all prescriptions
  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ["pharmacy-prescriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patients:patient_id (first_name, last_name),
          providers:provider_id (name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as PrescriptionWithRelations[];
    },
    enabled: !!user?.id
  });

  const filteredPrescriptions = prescriptions?.filter(prescription => {
    const patientName = prescription.patients ? 
      `${prescription.patients.first_name} ${prescription.patients.last_name}`.toLowerCase() : "";
    const medicationName = prescription.medication_name.toLowerCase();
    const providerName = prescription.providers?.name?.toLowerCase() || "";
    
    return searchTerm === "" || 
      patientName.includes(searchTerm.toLowerCase()) ||
      medicationName.includes(searchTerm.toLowerCase()) ||
      providerName.includes(searchTerm.toLowerCase());
  });

  const pendingPrescriptions = filteredPrescriptions?.filter(p => p.status === "prescribed") || [];
  const filledPrescriptions = filteredPrescriptions?.filter(p => p.status !== "prescribed") || [];

  const handleFillPrescription = (prescriptionId: string) => {
    if (!user?.id) return;
    
    updatePrescriptionStatus({
      id: prescriptionId,
      status: "administered",
      administeredBy: user.id
    }, {
      onSuccess: () => {
        toast({
          title: "Prescription filled",
          description: "The prescription has been marked as filled.",
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to fill prescription: ${(error as Error).message}`,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
            <p className="text-gray-600">Manage and fulfill prescriptions</p>
          </div>
          <div className="mt-4 md:mt-0 relative flex items-center w-full md:w-auto">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Pending</span>
              {pendingPrescriptions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingPrescriptions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="filled" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Filled</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-gray-500">Loading prescriptions...</div>
              </div>
            ) : pendingPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <Pill className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No pending prescriptions</p>
                  <p className="text-sm text-gray-400">All prescriptions have been filled</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPrescriptions.map((prescription) => (
                  <Card key={prescription.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
                          <CardDescription>
                            {prescription.patients ? 
                              `${prescription.patients.first_name} ${prescription.patients.last_name}` : 
                              "Unknown Patient"}
                          </CardDescription>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Pending
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
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-500">Instructions:</span>
                        </div>
                        <div className="text-gray-700 bg-gray-50 p-2 rounded text-xs">
                          {prescription.instructions || "No special instructions"}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full bg-health-600 hover:bg-health-700 text-white"
                        onClick={() => handleFillPrescription(prescription.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Fill Prescription
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="filled" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-gray-500">Loading prescriptions...</div>
              </div>
            ) : filledPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <Pill className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No filled prescriptions</p>
                  <p className="text-sm text-gray-400">Prescriptions that have been filled will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filledPrescriptions.map((prescription) => (
                  <Card key={prescription.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
                          <CardDescription>
                            {prescription.patients ? 
                              `${prescription.patients.first_name} ${prescription.patients.last_name}` : 
                              "Unknown Patient"}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Filled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                          <span className="font-medium text-gray-500">Filled on:</span>
                          <span>
                            {prescription.administered_at 
                              ? new Date(prescription.administered_at).toLocaleDateString() 
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PharmacistDashboard;
