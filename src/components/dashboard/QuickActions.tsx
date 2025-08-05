
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, FileText, Search, Heart, Pill, FileText as NoteIcon } from "lucide-react";
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
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => navigate('/patients?tab=vitals')}
          >
            <Heart className="h-10 w-10 text-red-500 mb-2" />
            <div className="font-medium text-sm">Add Vitals</div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => navigate('/patients?tab=medications')}
          >
            <Pill className="h-10 w-10 text-blue-500 mb-2" />
            <div className="font-medium text-sm">Add Medication</div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-center justify-center pt-6 pb-5 px-3 gap-2 border-dashed hover:border-primary hover:bg-background"
            onClick={() => navigate('/patients?tab=notes')}
          >
            <NoteIcon className="h-10 w-10 text-green-500 mb-2" />
            <div className="font-medium text-sm">Add Note</div>
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
