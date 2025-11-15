// @ts-nocheck - Uses pharmacy tables not yet created
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface MedicationAdministrationTabProps {
  onUpdate: () => void;
}

export const MedicationAdministrationTab: React.FC<MedicationAdministrationTabProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [scheduledMeds, setScheduledMeds] = useState<any[]>([]);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [administrationStatus, setAdministrationStatus] = useState('given');
  const [reason, setReason] = useState('');
  const [site, setSite] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadScheduledMedications();
  }, []);

  const loadScheduledMedications = async () => {
    try {
      // Load active medication orders
      const { data: orders, error } = await supabase
        .from('medication_orders')
        .select(`
          *,
          patient:patient_id (
            id,
            name,
            medical_record_number,
            room_number
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setScheduledMeds(orders || []);
    } catch (error) {
      console.error('Error loading medications:', error);
      toast.error('Failed to load medications');
    }
  };

  const handleAdminister = async () => {
    if (!selectedMed || !user) {
      toast.error('Please select a medication');
      return;
    }

    if (administrationStatus !== 'given' && !reason) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      setIsLoading(true);

      // Create MAR entry
      const { error } = await supabase
        .from('medication_administration_records')
        .insert({
          medication_order_id: selectedMed.id,
          patient_id: selectedMed.patient_id,
          medication_name: selectedMed.medication_name,
          dosage: selectedMed.dosage,
          route: selectedMed.route,
          administered_by: user.id,
          administered_at: new Date().toISOString(),
          scheduled_time: new Date().toISOString(),
          status: administrationStatus,
          reason: reason || null,
          site: site || null,
          notes: notes || null
        });

      if (error) throw error;

      // Update medication order if administered
      if (administrationStatus === 'given') {
        await supabase
          .from('medication_orders')
          .update({
            administered_at: new Date().toISOString(),
            administered_by: user.id
          })
          .eq('id', selectedMed.id);
      }

      toast.success(`Medication ${administrationStatus}`);
      setSelectedMed(null);
      setAdministrationStatus('given');
      setReason('');
      setSite('');
      setNotes('');
      loadScheduledMedications();
      onUpdate();
    } catch (error) {
      console.error('Error recording administration:', error);
      toast.error('Failed to record administration');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'given': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'refused': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'held': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'missed': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Medications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Scheduled Medications</h3>
          {scheduledMeds.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No medications scheduled
              </CardContent>
            </Card>
          ) : (
            scheduledMeds.map((med) => (
              <Card
                key={med.id}
                className={`cursor-pointer transition-colors ${
                  selectedMed?.id === med.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedMed(med)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{med.medication_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Patient: {med.patient?.name} (Room {med.patient?.room_number})
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                        <p><span className="font-medium">Route:</span> {med.route}</p>
                        <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                      </div>
                      {med.administered_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last: {format(new Date(med.administered_at), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Due
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Administration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Record Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMed ? (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold">{selectedMed.medication_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedMed.dosage} - {selectedMed.route}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Patient: {selectedMed.patient?.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={administrationStatus} onValueChange={setAdministrationStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="given">Given</SelectItem>
                      <SelectItem value="refused">Refused</SelectItem>
                      <SelectItem value="held">Held</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {administrationStatus !== 'given' && (
                  <div>
                    <label className="text-sm font-medium">Reason *</label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why medication was not given..."
                      rows={2}
                    />
                  </div>
                )}

                {selectedMed.route?.includes('injection') && (
                  <div>
                    <label className="text-sm font-medium">Injection Site</label>
                    <Select value={site} onValueChange={setSite}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left_deltoid">Left Deltoid</SelectItem>
                        <SelectItem value="right_deltoid">Right Deltoid</SelectItem>
                        <SelectItem value="left_thigh">Left Thigh</SelectItem>
                        <SelectItem value="right_thigh">Right Thigh</SelectItem>
                        <SelectItem value="abdomen">Abdomen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleAdminister}
                  disabled={isLoading || (administrationStatus !== 'given' && !reason)}
                  className="w-full"
                >
                  {getStatusIcon(administrationStatus)}
                  <span className="ml-2">
                    {isLoading ? 'Recording...' : `Record as ${administrationStatus}`}
                  </span>
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a medication to administer</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicationAdministrationTab;
