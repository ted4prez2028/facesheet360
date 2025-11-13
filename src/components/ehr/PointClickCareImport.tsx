import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Database, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FaceCapture from '@/components/facial-recognition/FaceCapture';

interface PointClickCareImportProps {
  onImportComplete?: () => void;
}

const PointClickCareImport = ({ onImportComplete }: PointClickCareImportProps) => {
  const [apiKey, setApiKey] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedPatientId, setImportedPatientId] = useState<string | null>(null);
  const [facialData, setFacialData] = useState<string | null>(null);

  const handleImport = async () => {
    if (!apiKey || !facilityId) {
      toast.error('Please provide API key and facility ID');
      return;
    }

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-pointclickcare-data', {
        body: { 
          apiKey,
          facilityId 
        }
      });

      if (error) throw error;

      setImportedPatientId(data.patientId);
      toast.success(`Imported ${data.recordsCount} patient records from PointClickCare`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import PointClickCare data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFacialCapture = async (facialDataString: string) => {
    if (!importedPatientId) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update({ facial_data: facialDataString })
        .eq('id', importedPatientId);

      if (error) throw error;

      setFacialData(facialDataString);
      toast.success('Facial recognition data attached successfully');
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Facial capture error:', error);
      toast.error('Failed to attach facial data');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import from PointClickCare
        </CardTitle>
        <CardDescription>
          Connect to PointClickCare API and import patient records with facial recognition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pcc-api-key">PointClickCare API Key</Label>
            <Input
              id="pcc-api-key"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isImporting || !!importedPatientId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility-id">Facility ID</Label>
            <Input
              id="facility-id"
              placeholder="Enter facility ID"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              disabled={isImporting || !!importedPatientId}
            />
          </div>

          <Button 
            onClick={handleImport}
            disabled={!apiKey || !facilityId || isImporting || !!importedPatientId}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Patient Data'}
          </Button>
        </div>

        {importedPatientId && !facialData && (
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>Patient data imported successfully</span>
            </div>
            <div className="space-y-2">
              <Label>Attach Facial Recognition</Label>
              <p className="text-sm text-muted-foreground">
                Now capture the patient's facial data to enable identification
              </p>
              <FaceCapture 
                mode="register" 
                patientId={importedPatientId}
                onCapture={handleFacialCapture}
              />
            </div>
          </div>
        )}

        {facialData && (
          <div className="flex items-center gap-2 text-sm text-green-600 border-t pt-4">
            <Check className="h-4 w-4" />
            <span>Import complete with facial recognition attached</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointClickCareImport;
