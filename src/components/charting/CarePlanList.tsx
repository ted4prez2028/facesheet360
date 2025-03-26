
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CarePlan {
  id: string;
  content: string;
  status: string;
  created_at: string;
  is_ai_generated: boolean;
}

interface CarePlanListProps {
  patientId: string;
}

export const CarePlanList: React.FC<CarePlanListProps> = ({ patientId }) => {
  const { data: carePlans, isLoading, error } = useQuery({
    queryKey: ['carePlans', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CarePlan[];
    },
    enabled: !!patientId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Loading care plans...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500">Error loading care plans</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!carePlans || carePlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No care plans available for this patient.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {carePlans.map((plan) => (
            <div key={plan.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Care Plan</span>
                  {getStatusBadge(plan.status)}
                  {plan.is_ai_generated && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                      AI Generated
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(plan.created_at).toLocaleDateString()}
                </span>
              </div>
              <ScrollArea className="h-40 w-full rounded-md border p-4">
                <div className="whitespace-pre-wrap">{plan.content}</div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
