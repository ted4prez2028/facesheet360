import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, BellOff, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CriticalAlert {
  id: string;
  patientId: string;
  patientName: string;
  vitalType: string;
  value: number;
  threshold: string;
  timestamp: Date;
  acknowledged: boolean;
}

const CriticalAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const addAlert = (alert: CriticalAlert) => {
    setAlerts(prev => [alert, ...prev]);
    
    if (soundEnabled) {
      // Play alert sound
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(e => console.log('Could not play alert sound:', e));
    }
    
    toast.error(`Critical Alert: ${alert.patientName}`, {
      description: `${alert.vitalType}: ${alert.value} (${alert.threshold})`,
      duration: 10000,
    });
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Critical Alerts
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive">{unacknowledgedCount}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No critical alerts
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-md border ${
                  alert.acknowledged
                    ? 'bg-muted border-muted'
                    : 'bg-destructive/10 border-destructive'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{alert.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.vitalType}: <span className="font-bold">{alert.value}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.threshold}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(alert.timestamp, 'PPpp')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalAlertsPanel;
