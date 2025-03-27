
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ClipboardList, Activity } from "lucide-react";
import { useQuickActions } from "@/hooks/useQuickActions";

const QuickActions = () => {
  const { addPatient, viewSchedule, createNote, viewAnalytics } = useQuickActions();

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-auto py-4 flex flex-col items-center justify-center gap-2" 
            variant="outline"
            onClick={addPatient}
          >
            <Users className="h-5 w-5" />
            <span>Add Patient</span>
          </Button>
          
          <Button 
            className="h-auto py-4 flex flex-col items-center justify-center gap-2" 
            variant="outline"
            onClick={viewSchedule}
          >
            <Calendar className="h-5 w-5" />
            <span>Schedule</span>
          </Button>
          
          <Button 
            className="h-auto py-4 flex flex-col items-center justify-center gap-2" 
            variant="outline"
            onClick={createNote}
          >
            <ClipboardList className="h-5 w-5" />
            <span>Create Note</span>
          </Button>
          
          <Button 
            className="h-auto py-4 flex flex-col items-center justify-center gap-2" 
            variant="outline"
            onClick={viewAnalytics}
          >
            <Activity className="h-5 w-5" />
            <span>Analytics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
