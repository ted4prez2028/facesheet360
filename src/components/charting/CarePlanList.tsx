
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Since the care_plans table doesn't exist in Supabase, we'll use mock data
  const carePlans: CarePlan[] = [
    {
      id: '1',
      content: 'Continue current medication regimen. Monitor blood pressure daily. Follow up in 2 weeks for medication adjustment if needed.',
      status: 'active',
      created_at: new Date().toISOString(),
      is_ai_generated: true
    },
    {
      id: '2',
      content: 'Physical therapy sessions 3x per week for mobility improvement. Focus on strength training and balance exercises.',
      status: 'active',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_ai_generated: false
    }
  ];

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
