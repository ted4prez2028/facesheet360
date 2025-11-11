import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Wind, 
  Droplets,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface VitalsData {
  id: string;
  patient_id: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  recorded_at: string;
}

interface VitalsMonitorProps {
  patientId: string;
  patientName: string;
}

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ patientId, patientName }) => {
  const [latestVitals, setLatestVitals] = useState<VitalsData | null>(null);
  const [previousVitals, setPreviousVitals] = useState<VitalsData | null>(null);
  const [isAbnormal, setIsAbnormal] = useState(false);

  useEffect(() => {
    // Fetch initial vitals
    fetchLatestVitals();

    // Set up realtime subscription
    const channel = supabase
      .channel('vitals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patient_vitals',
          filter: `patient_id=eq.${patientId}`
        },
        (payload) => {
          console.log('New vitals received:', payload);
          setPreviousVitals(latestVitals);
          setLatestVitals(payload.new as VitalsData);
          checkAbnormalVitals(payload.new as VitalsData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, latestVitals]);

  const fetchLatestVitals = async () => {
    const { data, error } = await supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(2);

    if (data && data.length > 0) {
      setLatestVitals(data[0]);
      if (data.length > 1) {
        setPreviousVitals(data[1]);
      }
      checkAbnormalVitals(data[0]);
    }
  };

  const checkAbnormalVitals = (vitals: VitalsData) => {
    const abnormal = 
      (vitals.temperature && (vitals.temperature > 100.4 || vitals.temperature < 95)) ||
      (vitals.heart_rate && (vitals.heart_rate > 120 || vitals.heart_rate < 50)) ||
      (vitals.blood_pressure_systolic && vitals.blood_pressure_systolic > 140) ||
      (vitals.oxygen_saturation && vitals.oxygen_saturation < 90) ||
      (vitals.respiratory_rate && (vitals.respiratory_rate > 24 || vitals.respiratory_rate < 12));
    
    setIsAbnormal(abnormal || false);
  };

  const getTrend = (current?: number, previous?: number) => {
    if (!current || !previous) return null;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return null;
  };

  const getVitalStatus = (vital: string, value?: number) => {
    if (!value) return 'default';
    
    switch (vital) {
      case 'temperature':
        return value > 100.4 || value < 95 ? 'destructive' : 'secondary';
      case 'heart_rate':
        return value > 120 || value < 50 ? 'destructive' : 'secondary';
      case 'bp_systolic':
        return value > 140 ? 'destructive' : 'secondary';
      case 'oxygen':
        return value < 90 ? 'destructive' : 'secondary';
      case 'respiratory':
        return value > 24 || value < 12 ? 'destructive' : 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!latestVitals) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No vitals recorded for {patientName}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isAbnormal ? 'border-destructive' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {patientName}
          </CardTitle>
          {isAbnormal && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Critical
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {format(new Date(latestVitals.recorded_at), 'PPpp')}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Temperature */}
          {latestVitals.temperature && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span>Temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getVitalStatus('temperature', latestVitals.temperature)}>
                  {latestVitals.temperature}°F
                </Badge>
                {getTrend(latestVitals.temperature, previousVitals?.temperature)}
              </div>
            </div>
          )}

          {/* Blood Pressure */}
          {latestVitals.blood_pressure_systolic && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Blood Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getVitalStatus('bp_systolic', latestVitals.blood_pressure_systolic)}>
                  {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                </Badge>
                {getTrend(latestVitals.blood_pressure_systolic, previousVitals?.blood_pressure_systolic)}
              </div>
            </div>
          )}

          {/* Heart Rate */}
          {latestVitals.heart_rate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>Heart Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getVitalStatus('heart_rate', latestVitals.heart_rate)}>
                  {latestVitals.heart_rate} bpm
                </Badge>
                {getTrend(latestVitals.heart_rate, previousVitals?.heart_rate)}
              </div>
            </div>
          )}

          {/* Oxygen Saturation */}
          {latestVitals.oxygen_saturation && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wind className="h-4 w-4" />
                <span>O2 Saturation</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getVitalStatus('oxygen', latestVitals.oxygen_saturation)}>
                  {latestVitals.oxygen_saturation}%
                </Badge>
                {getTrend(latestVitals.oxygen_saturation, previousVitals?.oxygen_saturation)}
              </div>
            </div>
          )}

          {/* Respiratory Rate */}
          {latestVitals.respiratory_rate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="h-4 w-4" />
                <span>Respiratory Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getVitalStatus('respiratory', latestVitals.respiratory_rate)}>
                  {latestVitals.respiratory_rate} /min
                </Badge>
                {getTrend(latestVitals.respiratory_rate, previousVitals?.respiratory_rate)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalsMonitor;
