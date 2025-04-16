
import React from 'react';
import { useCallLights } from '@/hooks/useCallLights';
import ActiveCallLights from './ActiveCallLights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const CallLightDashboard: React.FC = () => {
  const { 
    activeCallLights, 
    isLoading, 
    handleRespond, 
    handleComplete 
  } = useCallLights();
  
  const emergencyCount = activeCallLights.filter(
    call => call.request_type === 'emergency' && call.status === 'active'
  ).length;
  
  const activeCount = activeCallLights.filter(
    call => call.status === 'active'
  ).length;
  
  const inProgressCount = activeCallLights.filter(
    call => call.status === 'in_progress'
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> 
          Call Light Dashboard
        </CardTitle>
        <div className="flex items-center gap-2">
          {emergencyCount > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded">
              {emergencyCount} Emergency
            </span>
          )}
          <span className="bg-amber-100 text-amber-800 px-2 py-1 text-xs font-medium rounded">
            {activeCount} Active
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
            {inProgressCount} In Progress
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ActiveCallLights
          callLights={activeCallLights}
          isLoading={isLoading}
          onRespond={handleRespond}
          onComplete={handleComplete}
        />
      </CardContent>
    </Card>
  );
};

export default CallLightDashboard;
