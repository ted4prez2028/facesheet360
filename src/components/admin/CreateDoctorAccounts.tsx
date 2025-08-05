import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, UserPlus, Shield } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRolePermissions } from '@/hooks/useRolePermissions';

interface Doctor {
  name: string;
  email: string;
  specialty?: string;
  organization?: string;
}

const CreateDoctorAccounts = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualDoctors, setManualDoctors] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hasRole } = useRolePermissions();

  // Check if user is admin
  const isAdmin = hasRole('admin');

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You don't have permission to access this feature.</p>
        </CardContent>
      </Card>
    );
  }

  const parseCsvData = (csvText: string): Doctor[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const doctor: Doctor = {
        name: '',
        email: ''
      };
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        if (header.includes('name')) doctor.name = value;
        if (header.includes('email')) doctor.email = value;
        if (header.includes('specialty')) doctor.specialty = value;
        if (header.includes('organization')) doctor.organization = value;
      });
      
      return doctor;
    }).filter(doctor => doctor.name && doctor.email);
  };

  const parseManualData = (text: string): Doctor[] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        name: parts[0] || '',
        email: parts[1] || '',
        specialty: parts[2] || 'General Medicine',
        organization: parts[3] || 'Healthcare System'
      };
    }).filter(doctor => doctor.name && doctor.email);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
    }
  };

  const createAccounts = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      let doctors: Doctor[] = [];
      
      if (csvFile) {
        const csvText = await csvFile.text();
        doctors = parseCsvData(csvText);
      } else if (manualDoctors) {
        doctors = parseManualData(manualDoctors);
      }
      
      if (doctors.length === 0) {
        toast({
          title: "No Data",
          description: "Please provide doctor information via CSV file or manual entry.",
          variant: "destructive"
        });
        return;
      }

      console.log('Creating accounts for:', doctors);
      
      const { data, error } = await supabase.functions.invoke('create-doctor-accounts', {
        body: { doctors }
      });

      if (error) {
        throw error;
      }

      setResults(data.results);
      
      const successful = data.results.filter((r: any) => r.success).length;
      const failed = data.results.filter((r: any) => !r.success).length;
      
      toast({
        title: "Account Creation Complete",
        description: `Successfully created ${successful} accounts. ${failed} failed.`,
        variant: successful > 0 ? "default" : "destructive"
      });
      
      // Clear inputs
      setCsvFile(null);
      setManualDoctors('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Error creating accounts:", error);
      toast({
        title: "Error",
        description: "Failed to create doctor accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Doctor Accounts
            <Shield className="h-4 w-4 text-primary ml-auto" />
          </CardTitle>
          <CardDescription>
            Create accounts for healthcare providers and email them login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <div className="mt-2">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              <p className="text-sm text-muted-foreground mt-1">
                CSV should have columns: name, email, specialty (optional), organization (optional)
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div>
            <Label htmlFor="manual-entry">Manual Entry</Label>
            <Textarea
              id="manual-entry"
              placeholder="Enter doctor information, one per line:&#10;Dr. John Smith, john.smith@hospital.com, Cardiology, City Hospital&#10;Dr. Jane Doe, jane.doe@clinic.com, Pediatrics, Family Clinic"
              value={manualDoctors}
              onChange={(e) => setManualDoctors(e.target.value)}
              rows={6}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Format: Name, Email, Specialty, Organization (one per line)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createAccounts} 
            disabled={isLoading || (!csvFile && !manualDoctors)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Accounts & Sending Emails...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Doctor Accounts
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {results.length > 0 && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Creation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.email}</span>
                    <span className={`text-sm ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {result.success ? '✓ Success' : '✗ Failed'}
                    </span>
                  </div>
                  {result.success && result.emailSent === false && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Account created but email failed to send
                    </p>
                  )}
                  {!result.success && result.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateDoctorAccounts;