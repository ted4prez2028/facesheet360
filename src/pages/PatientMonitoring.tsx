import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import VitalsMonitor from '@/components/monitoring/VitalsMonitor';
import CriticalAlertsPanel from '@/components/monitoring/CriticalAlertsPanel';
import { Spinner } from '@/components/ui/spinner';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
}

const PatientMonitoring: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [monitoredPatients, setMonitoredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchPatients();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchPatients();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchPatients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name, medical_record_number')
      .order('last_name');

    if (data) {
      setPatients(data);
      // By default, monitor first 6 patients
      if (monitoredPatients.length === 0) {
        setMonitoredPatients(data.slice(0, 6));
      }
    }
    setIsLoading(false);
  };

  const addToMonitoring = (patient: Patient) => {
    if (!monitoredPatients.find(p => p.id === patient.id)) {
      setMonitoredPatients([...monitoredPatients, patient]);
    }
  };

  const removeFromMonitoring = (patientId: string) => {
    setMonitoredPatients(monitoredPatients.filter(p => p.id !== patientId));
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.medical_record_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Real-Time Patient Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor critical patients with live vitals updates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={fetchPatients} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="mb-6">
        <CriticalAlertsPanel />
      </div>

      {/* Search and Add Patients */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add Patients to Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {searchTerm && (
            <div className="mt-4 space-y-2">
              {filteredPatients.map((patient) => {
                const isMonitored = monitoredPatients.find(p => p.id === patient.id);
                return (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        MRN: {patient.medical_record_number}
                      </div>
                    </div>
                    <Button
                      variant={isMonitored ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        isMonitored
                          ? removeFromMonitoring(patient.id)
                          : addToMonitoring(patient)
                      }
                    >
                      {isMonitored ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitored Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monitoredPatients.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No patients currently being monitored. Search and add patients above.
              </p>
            </CardContent>
          </Card>
        ) : (
          monitoredPatients.map((patient) => (
            <VitalsMonitor
              key={patient.id}
              patientId={patient.id}
              patientName={`${patient.first_name} ${patient.last_name}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PatientMonitoring;
