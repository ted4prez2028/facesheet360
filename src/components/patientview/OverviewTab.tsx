import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Pill, 
  FileText,
  Camera,
  Activity,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import FaceRegistration from '@/components/facial-recognition/FaceRegistration';
import { Badge } from '@/components/ui/badge';

interface OverviewTabProps {
  patientId: string;
}

interface PatientVital {
  id: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  pain_scale?: number;
  recorded_at: string;
  recorded_by: string;
}

interface MedicationOrder {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route?: string;
  start_date: string;
  end_date?: string;
  status: string;
}

interface LabResult {
  id: string;
  test_name: string;
  result_value?: string;
  result_unit?: string;
  status: string;
  performed_at?: string;
  notes?: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ patientId }) => {
  const [latestVitals, setLatestVitals] = useState<PatientVital | null>(null);
  const [activeMedications, setActiveMedications] = useState<MedicationOrder[]>([]);
  const [recentLabs, setRecentLabs] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, [patientId]);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    
    // Fetch latest vitals
    const { data: vitalsData } = await supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    
    if (vitalsData) {
      setLatestVitals(vitalsData);
    }

    // Fetch active medications
    const { data: medsData } = await supabase
      .from('medication_orders')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(3);
    
    if (medsData) {
      setActiveMedications(medsData);
    }

    // Fetch recent labs
    const { data: labsData } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('performed_at', { ascending: false })
      .limit(3);
    
    if (labsData) {
      setRecentLabs(labsData);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Facial Recognition Section */}
      <FaceRegistration patientId={patientId} />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Latest Vitals Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Latest Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestVitals ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {format(new Date(latestVitals.recorded_at), 'MM/dd/yyyy')}
                </div>
                <div className="space-y-1">
                  {latestVitals.temperature && (
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="h-3 w-3" />
                      <span>Temp: {latestVitals.temperature}°F</span>
                    </div>
                  )}
                  {latestVitals.blood_pressure_systolic && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-3 w-3" />
                      <span>BP: {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}</span>
                    </div>
                  )}
                  {latestVitals.heart_rate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-3 w-3" />
                      <span>HR: {latestVitals.heart_rate} bpm</span>
                    </div>
                  )}
                  {latestVitals.oxygen_saturation && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="h-3 w-3" />
                      <span>O2: {latestVitals.oxygen_saturation}%</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No vitals recorded</div>
            )}
          </CardContent>
        </Card>

        {/* Active Medications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" />
              Active Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMedications.length > 0 ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{activeMedications.length} active</div>
                <div className="space-y-1">
                  {activeMedications.map((med) => (
                    <div key={med.id} className="text-sm">
                      <div className="font-medium">{med.medication_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No active medications</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Labs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Recent Labs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLabs.length > 0 ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{recentLabs.length} results</div>
                <div className="space-y-1">
                  {recentLabs.map((lab) => (
                    <div key={lab.id} className="text-sm">
                      <div className="font-medium">{lab.test_name}</div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={lab.status === 'completed' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {lab.status}
                        </Badge>
                        {lab.result_value && (
                          <span className="text-xs text-muted-foreground">
                            {lab.result_value} {lab.result_unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No recent labs</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
