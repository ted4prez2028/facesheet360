import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const CreateDoctorAccounts = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createAccounts = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Feature Coming Soon",
        description: "Real user account creation will be available soon.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating accounts:", error);
      toast({
        title: "Feature Coming Soon",
        description: "Real user account creation will be available soon.",
        variant: "default",
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
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Real user management system coming soon</p>
          <p className="text-sm text-gray-400">This feature will allow creating and managing healthcare provider accounts</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={createAccounts} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Create Accounts (Coming Soon)"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateDoctorAccounts;