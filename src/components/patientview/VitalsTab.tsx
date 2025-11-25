import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { usePatientCRUD } from '@/hooks/usePatientCRUD';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface VitalsTabProps {
  patientId: string;
}

const VitalsTab: React.FC<VitalsTabProps> = ({ patientId }) => {
  const [isAddVitalOpen, setIsAddVitalOpen] = useState(false);
  const [formData, setFormData] = useState({
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    pain_scale: ''
  });
  
  const { createRecord } = usePatientCRUD();
  const queryClient = useQueryClient();
  
  // Fetch real vitals data from database
  const { data: vitalsData = [] } = useQuery({
    queryKey: ['patient-vitals', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_vitals')
        .select('*, recorded_by_profile:profiles!patient_vitals_recorded_by_fkey(name)')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  const handleSaveVitals = async () => {
    const vitalsToSave = Object.entries(formData)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => ({ 
        ...acc, 
        [key]: parseFloat(value) 
      }), {});

    if (Object.keys(vitalsToSave).length === 0) {
      toast.error('Please enter at least one vital sign');
      return;
    }

    try {
      await createRecord('patient_vitals', {
        patient_id: patientId,
        ...vitalsToSave
      });

      // Invalidate and refetch the vitals query to update the list immediately
      await queryClient.invalidateQueries({ queryKey: ['patient-vitals', patientId] });

      setFormData({
        temperature: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        pain_scale: ''
      });
      setIsAddVitalOpen(false);
      toast.success('Vital signs saved successfully');
    } catch (error) {
      toast.error('Failed to save vital signs');
      console.error('Error saving vitals:', error);
    }
  };

  const handleExportExcel = () => {
    const exportData = vitalsData.map(v => ({
      Temperature: v.temperature || '-',
      'Blood Pressure': v.blood_pressure_systolic && v.blood_pressure_diastolic 
        ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '-',
      'Heart Rate': v.heart_rate || '-',
      'Respiratory Rate': v.respiratory_rate || '-',
      'O2 Saturation': v.oxygen_saturation || '-',
      Weight: v.weight || '-',
      Height: v.height || '-',
      'Pain Scale': v.pain_scale || '-',
      'Recorded At': format(new Date(v.recorded_at), 'MM/dd/yyyy HH:mm'),
      'Recorded By': v.recorded_by_profile?.name || 'Unknown'
    }));
    exportToExcel(exportData, 'vital-signs');
  };

  const handleExportPdf = () => {
    const exportData = vitalsData.map(v => ({
      Temperature: v.temperature || '-',
      'Blood Pressure': v.blood_pressure_systolic && v.blood_pressure_diastolic 
        ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '-',
      'Heart Rate': v.heart_rate || '-',
      'Respiratory Rate': v.respiratory_rate || '-',
      'O2 Saturation': v.oxygen_saturation || '-',
      Weight: v.weight || '-',
      Height: v.height || '-',
      'Pain Scale': v.pain_scale || '-',
      'Recorded At': format(new Date(v.recorded_at), 'MM/dd/yyyy HH:mm'),
      'Recorded By': v.recorded_by_profile?.name || 'Unknown'
    }));
    exportToPdf('Vital Signs Report', exportData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Vital Signs</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddVitalOpen} onOpenChange={setIsAddVitalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vitals</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input 
                      id="temperature" 
                      type="number" 
                      step="0.1"
                      placeholder="98.6"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="systolic">Systolic BP</Label>
                    <Input 
                      id="systolic" 
                      type="number"
                      placeholder="120"
                      value={formData.blood_pressure_systolic}
                      onChange={(e) => setFormData({...formData, blood_pressure_systolic: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">Diastolic BP</Label>
                    <Input 
                      id="diastolic" 
                      type="number"
                      placeholder="80"
                      value={formData.blood_pressure_diastolic}
                      onChange={(e) => setFormData({...formData, blood_pressure_diastolic: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="heart_rate">Heart Rate</Label>
                    <Input 
                      id="heart_rate" 
                      type="number"
                      placeholder="90"
                      value={formData.heart_rate}
                      onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
                    <Input 
                      id="respiratory_rate" 
                      type="number"
                      placeholder="16"
                      value={formData.respiratory_rate}
                      onChange={(e) => setFormData({...formData, respiratory_rate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oxygen_saturation">O2 Saturation (%)</Label>
                    <Input 
                      id="oxygen_saturation" 
                      type="number"
                      placeholder="99"
                      value={formData.oxygen_saturation}
                      onChange={(e) => setFormData({...formData, oxygen_saturation: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddVitalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveVitals}>Save Vitals</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Temperature</TableHead>
            <TableHead>Blood Pressure</TableHead>
            <TableHead>Heart Rate</TableHead>
            <TableHead>Respiratory Rate</TableHead>
            <TableHead>O2 Saturation</TableHead>
            <TableHead>Recorded At</TableHead>
            <TableHead>Recorded By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vitalsData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No vital signs recorded yet
              </TableCell>
            </TableRow>
          ) : (
            vitalsData.map((vital) => (
              <TableRow key={vital.id}>
                <TableCell>{vital.temperature ? `${vital.temperature}°F` : '-'}</TableCell>
                <TableCell>
                  {vital.blood_pressure_systolic && vital.blood_pressure_diastolic 
                    ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}` 
                    : '-'}
                </TableCell>
                <TableCell>{vital.heart_rate ? `${vital.heart_rate} bpm` : '-'}</TableCell>
                <TableCell>{vital.respiratory_rate ? `${vital.respiratory_rate}/min` : '-'}</TableCell>
                <TableCell>{vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : '-'}</TableCell>
                <TableCell>{format(new Date(vital.recorded_at), 'MM/dd/yyyy HH:mm')}</TableCell>
                <TableCell>{vital.recorded_by_profile?.name || 'Unknown'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VitalsTab;
