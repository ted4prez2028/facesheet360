
import React, { useState } from 'react';
import { useMedications, useMedicationsMutation } from '@/hooks/useChartData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Save, Ban, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useAuth } from '@/context/AuthContext';

interface MedicationFormValues {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: "active" | "discontinued" | "completed";
}

interface MedicationsPanelProps {
  patientId: string | null;
}

const MedicationsPanel: React.FC<MedicationsPanelProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  
  const initialValues: MedicationFormValues = {
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    status: 'active'
  };
  
  const [formValues, setFormValues] = useState<MedicationFormValues>(initialValues);
  
  const { data: medications, isLoading, refetch } = useMedications(patientId);
  const { saveMedication, isLoading: isSaving } = useMedicationsMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !user?.id) {
      toast({
        title: "Error",
        description: "Patient ID or provider ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (!formValues.medication_name || !formValues.dosage || !formValues.frequency) {
      toast({
        title: "Required fields missing",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await saveMedication({
        patient_id: patientId,
        prescribed_date: new Date().toISOString(),
        medication_name: formValues.medication_name,
        dosage: formValues.dosage,
        frequency: formValues.frequency,
        duration: formValues.duration || undefined,
        instructions: formValues.instructions || undefined,
        status: formValues.status
      });
      
      toast({
        title: "Success",
        description: "Medication recorded successfully"
      });
      
      setFormValues(initialValues);
      setIsAdding(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record medication",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'discontinued':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <Ban className="h-3 w-3 mr-1" />
            Discontinued
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-gray-500">Loading medications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Medications</h3>
        {!isAdding && (
          <Button 
            className="gap-2 bg-health-600 hover:bg-health-700"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Pill className="h-4 w-4" />
            <span>Add Medication</span>
          </Button>
        )}
      </div>
      
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescribe Medication</CardTitle>
            <CardDescription>Enter details of the medication</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication_name">Medication Name</Label>
                <Input 
                  id="medication_name" 
                  name="medication_name"
                  value={formValues.medication_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Amoxicillin"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input 
                    id="dosage" 
                    name="dosage"
                    value={formValues.dosage}
                    onChange={handleInputChange}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input 
                    id="frequency" 
                    name="frequency"
                    value={formValues.frequency}
                    onChange={handleInputChange}
                    placeholder="e.g., Twice daily"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    name="duration"
                    value={formValues.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 10 days"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formValues.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea 
                  id="instructions" 
                  name="instructions"
                  value={formValues.instructions}
                  onChange={handleInputChange}
                  placeholder="e.g., Take with food to avoid stomach upset"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-health-600 hover:bg-health-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Medication
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          {medications && medications.length > 0 ? (
            medications.map((medication) => (
              <Card key={medication.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {medication.medication_name}
                        {getStatusBadge(medication.status)}
                      </CardTitle>
                      <CardDescription>
                        Prescribed: {format(new Date(medication.prescribed_date), 'MMMM d, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm font-medium">Dosage:</span>
                        <span className="text-sm ml-2">{medication.dosage}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Frequency:</span>
                        <span className="text-sm ml-2">{medication.frequency}</span>
                      </div>
                      
                      {medication.duration && (
                        <div>
                          <span className="text-sm font-medium">Duration:</span>
                          <span className="text-sm ml-2">{medication.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {medication.instructions && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Instructions:</p>
                        <p className="text-sm mt-1 text-gray-600">{medication.instructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Pill className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No medications recorded for this patient</p>
              <p className="text-sm mt-1">Click "Add Medication" to prescribe a medication</p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default MedicationsPanel;
