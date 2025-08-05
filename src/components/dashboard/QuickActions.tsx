
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, FileText, Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import CallLightDashboard from '@/components/call-light/CallLightDashboard';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [callLightOpen, setCallLightOpen] = useState(false);

  return (
    <>
      <Card className="shadow-custom-medium rounded-xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => navigate('/patients')}
          >
            <Search className="h-10 w-10 text-muted-foreground/70 mb-2" />
            <div className="font-medium text-sm">Find Patient</div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => navigate('/appointments')}
          >
            <Calendar className="h-10 w-10 text-muted-foreground/70 mb-2" />
            <div className="font-medium text-sm">Schedule Appointment</div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => navigate('/charting')}
          >
            <FileText className="h-10 w-10 text-muted-foreground/70 mb-2" />
            <div className="font-medium text-sm">Patient Chart</div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => setCallLightOpen(true)}
          >
            <Bell className="h-10 w-10 text-amber-500 mb-2" />
            <div className="font-medium text-sm">Call Light Dashboard</div>
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={callLightOpen} onOpenChange={setCallLightOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Call Light Dashboard</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <CallLightDashboard />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
