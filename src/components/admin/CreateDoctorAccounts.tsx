
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
// Remove sample doctors - use real user data instead
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Result {
  email: string;
  success: boolean;
  error?: string;
  emailSent?: boolean;
}

const CreateDoctorAccounts = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const handleToggleDoctor = (id: string) => {
    setSelectedDoctors(prev => {
      if (prev.includes(id)) {
        return prev.filter(docId => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    // Functionality removed - use real user management instead
    setSelectedDoctors([]);
  };

  const createAccounts = async () => {
    if (selectedDoctors.length === 0) {
      toast({
        title: "No doctors selected",
        description: "Please select at least one doctor to create accounts for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get selected doctors' data
      // Use real user data instead of sample data
      console.log('Real user account creation not implemented yet');
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('create-doctor-accounts', {
        body: { doctors: doctorsToCreate }
      });
      
      if (error) throw error;
      
      setResults(data.results);
      
      // Count successes
      const successCount = data.results.filter((r: Result) => r.success).length;
      
      toast({
        title: "Account creation complete",
        description: `Successfully created ${successCount} out of ${selectedDoctors.length} accounts.`,
        variant: successCount > 0 ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error("Error creating accounts:", error);
      toast({
        title: "Failed to create accounts",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Create Doctor Accounts</CardTitle>
        <CardDescription>
          Create accounts for healthcare providers and email them login credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            onClick={handleSelectAll}
          >
            {selectedDoctors.length === sampleDoctors.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedDoctors.length} of {sampleDoctors.length} selected
          </span>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {sampleDoctors.map(doctor => (
            <div key={doctor.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-accent/10">
              <Checkbox
                checked={selectedDoctors.includes(doctor.id!)}
                onCheckedChange={() => handleToggleDoctor(doctor.id!)}
                id={`doctor-${doctor.id}`}
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <label 
                    htmlFor={`doctor-${doctor.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {doctor.name}
                  </label>
                  <Badge variant="outline">{doctor.specialty}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {doctor.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {doctor.organization}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {results.length > 0 && (
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Results</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className={`text-sm p-2 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between">
                    <span>{result.email}</span>
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {!result.success && <div className="text-red-500 text-xs mt-1">{result.error}</div>}
                  {result.success && (
                    <div className="text-xs mt-1">
                      Account created: ✅ | Email sent: {result.emailSent ? '✅' : '❌'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={createAccounts} 
          disabled={isLoading || selectedDoctors.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating accounts...
            </>
          ) : (
            "Create Accounts & Send Emails"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateDoctorAccounts;
