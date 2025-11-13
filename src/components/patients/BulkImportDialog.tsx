import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const BulkImportDialog = ({ open, onOpenChange, onImportComplete }: BulkImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast.error('Please select a valid CSV or Excel file');
      }
    }
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const validateRow = (row: any, index: number): { valid: boolean; error?: string } => {
    if (!row.name && (!row.first_name || !row.last_name)) {
      return { valid: false, error: `Row ${index + 1}: Missing patient name` };
    }
    if (!row.date_of_birth) {
      return { valid: false, error: `Row ${index + 1}: Missing date of birth` };
    }
    if (!row.gender) {
      return { valid: false, error: `Row ${index + 1}: Missing gender` };
    }
    return { valid: true };
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      const rows = await parseFile(file);
      
      if (rows.length === 0) {
        toast.error('No data found in file');
        setImporting(false);
        return;
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const validation = validateRow(row, i);
        
        if (!validation.valid) {
          errors.push(validation.error!);
          failedCount++;
          continue;
        }

        try {
          const patientData = {
            name: row.name || `${row.first_name} ${row.last_name}`.trim(),
            date_of_birth: row.date_of_birth,
            gender: row.gender,
            email: row.email || null,
            phone: row.phone || null,
            address: row.address || null,
            medical_record_number: row.medical_record_number || null,
            insurance_provider: row.insurance_provider || null,
            room_number: row.room_number || null,
            status: row.status || 'active'
          };

          const { error } = await supabase
            .from('patients')
            .insert(patientData);

          if (error) {
            errors.push(`Row ${i + 1}: ${error.message}`);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          failedCount++;
        }

        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      setResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show first 10 errors
      });

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} patient(s)`);
        onImportComplete();
      }

      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} patient(s)`);
      }
    } catch (error) {
      toast.error('Failed to process file');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'John Doe',
        date_of_birth: '1980-01-15',
        gender: 'Male',
        email: 'john@example.com',
        phone: '555-0123',
        address: '123 Main St',
        medical_record_number: 'MRN001',
        insurance_provider: 'Blue Cross',
        room_number: '101',
        status: 'active'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patients Template');
    XLSX.writeFile(wb, 'patients_import_template.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Patients</DialogTitle>
          <DialogDescription>
            Import multiple patients from a CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Required columns: name (or first_name + last_name), date_of_birth, gender</p>
                <Button variant="link" className="p-0 h-auto" onClick={downloadTemplate}>
                  Download Template File
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {!result && (
            <>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={importing}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {file ? (
                    <>
                      <FileSpreadsheet className="h-12 w-12 text-primary" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to select CSV or Excel file
                      </p>
                    </>
                  )}
                </label>
              </div>

              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Success:</strong> {result.success} patients
                  </AlertDescription>
                </Alert>
                
                {result.failed > 0 && (
                  <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Failed:</strong> {result.failed} patients
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Errors:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((error, i) => (
                      <p key={i} className="text-xs text-destructive">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {result ? (
              <>
                <Button variant="outline" onClick={resetDialog}>
                  Import Another File
                </Button>
                <Button onClick={() => { resetDialog(); onOpenChange(false); }}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!file || importing}>
                  {importing ? 'Importing...' : 'Import Patients'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
