
import React, { useState } from 'react';
import { useLabResults, useLabResultsMutation } from '@/hooks/useChartData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TestTube, Save, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/context/AuthContext';

interface LabResultFormValues {
  test_name: string;
  test_result: string;
  normal_range: string;
  units: string;
  flagged: boolean;
  notes: string;
}

interface LabResultsPanelProps {
  patientId: string | null;
}

const LabResultsPanel: React.FC<LabResultsPanelProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  
  const initialValues: LabResultFormValues = {
    test_name: '',
    test_result: '',
    normal_range: '',
    units: '',
    flagged: false,
    notes: ''
  };
  
  const [formValues, setFormValues] = useState<LabResultFormValues>(initialValues);
  
  const { data: labResults, isLoading, refetch } = useLabResults(patientId);
  const { saveLabResult, isLoading: isSaving } = useLabResultsMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: checked }));
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
    
    if (!formValues.test_name || !formValues.test_result) {
      toast({
        title: "Required fields missing",
        description: "Please enter test name and result",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await saveLabResult({
        patient_id: patientId,
        date_performed: new Date().toISOString(),
        test_name: formValues.test_name,
        test_result: formValues.test_result,
        normal_range: formValues.normal_range || undefined,
        units: formValues.units || undefined,
        flagged: formValues.flagged,
        notes: formValues.notes || undefined
      });
      
      toast({
        title: "Success",
        description: "Lab result recorded successfully"
      });
      
      setFormValues(initialValues);
      setIsAdding(false);
      refetch();

      // Mint CareCoins for the provider
      mintCareCoin(user.id, patientId, {
        labResult: formValues,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record lab result",
        variant: "destructive"
      });
    }
  };

  interface LabResultChartData {
  labResult: LabResultFormValues;
}

  const mintCareCoin = async (providerId: string, patientId: string, chartData: LabResultChartData) => {
    try {
      const response = await fetch("/api/mint-carecoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId, patientId, chartData }),
      });

      if (!response.ok) {
        throw new Error("Failed to mint CareCoins");
      }

      const data = await response.json();
      toast({
        title: "CareCoins Minted",
        description: `You have been awarded ${data.amount} CareCoins!`,
      });
    } catch (error) {
      console.error("Error minting CareCoins:", error);
      toast({
        title: "Minting Error",
        description: "Could not mint CareCoins at this time.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-gray-500">Loading lab results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Lab Results</h3>
        {!isAdding && (
          <Button 
            className="gap-2 bg-health-600 hover:bg-health-700"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <TestTube className="h-4 w-4" />
            <span>Add Lab Result</span>
          </Button>
        )}
      </div>
      
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record Lab Result</CardTitle>
            <CardDescription>Enter details of the laboratory test</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test_name">Test Name</Label>
                <Input 
                  id="test_name" 
                  name="test_name"
                  value={formValues.test_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Complete Blood Count"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test_result">Result</Label>
                  <Input 
                    id="test_result" 
                    name="test_result"
                    value={formValues.test_result}
                    onChange={handleInputChange}
                    placeholder="e.g., 140"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Input 
                    id="units" 
                    name="units"
                    value={formValues.units}
                    onChange={handleInputChange}
                    placeholder="e.g., mg/dL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="normal_range">Normal Range</Label>
                  <Input 
                    id="normal_range" 
                    name="normal_range"
                    value={formValues.normal_range}
                    onChange={handleInputChange}
                    placeholder="e.g., 70-100"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="flagged" 
                  name="flagged"
                  checked={formValues.flagged}
                  onCheckedChange={() => setFormValues(prev => ({ ...prev, flagged: !prev.flagged }))}
                />
                <label
                  htmlFor="flagged"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Flag as abnormal
                </label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes"
                  value={formValues.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional observations or interpretations..."
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
                    Save Result
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          {labResults && labResults.length > 0 ? (
            labResults.map((result) => (
              <Card key={result.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        {result.test_name}
                        {result.flagged && (
                          <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300 bg-amber-50">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Abnormal
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {new Date(result.date_performed).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Result:</span>
                      <span className="text-sm font-semibold">
                        {result.test_result} {result.units && `${result.units}`}
                      </span>
                    </div>
                    
                    {result.normal_range && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Normal Range:</span>
                        <span className="text-sm">{result.normal_range} {result.units && `${result.units}`}</span>
                      </div>
                    )}
                    
                    {result.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Notes:</p>
                        <p className="text-sm mt-1 text-gray-600">{result.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <TestTube className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No lab results recorded for this patient</p>
              <p className="text-sm mt-1">Click "Add Lab Result" to add new data</p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default LabResultsPanel;
