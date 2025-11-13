import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TimelineEvent, { TimelineEventData } from './TimelineEvent';
import { Spinner } from '@/components/ui/spinner';

interface PatientTimelineProps {
  patientId: string;
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({ patientId }) => {
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7days');

  useEffect(() => {
    fetchTimelineEvents();
  }, [patientId, timeRange]);

  useEffect(() => {
    applyFilters();
  }, [events, filterType]);

  const fetchTimelineEvents = async () => {
    setIsLoading(true);
    const allEvents: TimelineEventData[] = [];

    // Calculate date filter
    const startDate = new Date();
    switch (timeRange) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        startDate.setFullYear(2000);
        break;
    }

    // Fetch vitals
    const { data: vitals } = await supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patientId)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false });

    if (vitals) {
      vitals.forEach(vital => {
        const vitalDetails: any = {};
        if (vital.temperature) vitalDetails.Temperature = `${vital.temperature}°F`;
        if (vital.blood_pressure_systolic) vitalDetails['Blood Pressure'] = `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`;
        if (vital.heart_rate) vitalDetails['Heart Rate'] = `${vital.heart_rate} bpm`;
        if (vital.oxygen_saturation) vitalDetails['O2 Saturation'] = `${vital.oxygen_saturation}%`;

        allEvents.push({
          id: vital.id,
          type: 'vital',
          timestamp: new Date(vital.recorded_at),
          title: 'Vital Signs Recorded',
          description: 'Patient vital signs were recorded',
          details: vitalDetails
        });
      });
    }

    // Fetch medication administrations
    const { data: meds } = await supabase
      .from('medication_administration_records')
      .select('*')
      .eq('patient_id', patientId)
      .gte('administered_at', startDate.toISOString())
      .order('administered_at', { ascending: false });

    if (meds) {
      meds.forEach(med => {
        allEvents.push({
          id: med.id,
          type: 'medication',
          timestamp: new Date(med.administered_at),
          title: med.medication_name,
          description: `Medication administered: ${med.dosage} via ${med.route}`,
          details: {
            Dosage: med.dosage,
            Route: med.route,
            Status: med.status
          },
          recordedBy: med.administered_by
        });
      });
    }

    // Fetch lab results
    const { data: labs } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (labs) {
      labs.forEach(lab => {
        allEvents.push({
          id: lab.id,
          type: 'lab',
          timestamp: new Date(lab.created_at),
          title: lab.test_name,
          description: `Lab test ${lab.status}`,
          details: {
            Status: lab.status,
            Result: lab.result_value ? `${lab.result_value} ${lab.unit || ''}` : 'Pending'
          }
        });
      });
    }

    // Fetch wound assessments
    const { data: wounds } = await supabase
      .from('wound_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (wounds) {
      wounds.forEach((wound: any) => {
        allEvents.push({
          id: wound.id,
          type: 'wound',
          timestamp: new Date(wound.created_at),
          title: `Wound Assessment - ${wound.wound_type || 'Unknown'}`,
          description: wound.ai_analysis || 'Wound assessment performed',
          details: {
            Type: wound.wound_type || 'N/A',
            'Size (cm)': wound.length_cm && wound.width_cm ? `${wound.length_cm} x ${wound.width_cm}` : 'N/A',
            Status: wound.status || 'N/A'
          }
        });
      });
    }

    // Sort all events by timestamp
    allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setEvents(allEvents);
    setIsLoading(false);
  };

  const applyFilters = () => {
    if (filterType === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === filterType));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Patient Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">24 Hours</SelectItem>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="vital">Vitals</SelectItem>
                <SelectItem value="medication">Medications</SelectItem>
                <SelectItem value="lab">Labs</SelectItem>
                <SelectItem value="wound">Wounds</SelectItem>
                <SelectItem value="procedure">Procedures</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={fetchTimelineEvents}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events found for the selected filters</p>
          </div>
        ) : (
          <div className="mt-4">
            {filteredEvents.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={index === filteredEvents.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientTimeline;
