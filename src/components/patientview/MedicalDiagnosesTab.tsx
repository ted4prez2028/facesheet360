import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Plus, Filter } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { useMedicalDiagnoses } from '@/hooks/useMedicalDiagnoses';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface MedicalDiagnosesTabProps {
  patientId: string;
}

const MedicalDiagnosesTab: React.FC<MedicalDiagnosesTabProps> = ({ patientId }) => {
  const { user } = useAuth();
  const { diagnoses, isLoading, addDiagnosis } = useMedicalDiagnoses(patientId);
  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [icdCode, setIcdCode] = useState('');
  const [description, setDescription] = useState('');
  const [clinicalCategory, setClinicalCategory] = useState('');
  const [rank, setRank] = useState('');
  const [classification, setClassification] = useState('');

  const handleExportExcel = () => {
    exportToExcel(diagnoses, 'medical-diagnoses');
  };

  const handleExportPdf = () => {
    exportToPdf('Medical Diagnoses Report', diagnoses);
  };

  const handleAddDiagnosis = async () => {
    if (!icdCode || !description) {
      return;
    }

    await addDiagnosis.mutateAsync({
      patient_id: patientId,
      icd_code: icdCode,
      description,
      clinical_category: clinicalCategory,
      diagnosis_rank: rank,
      classification,
      diagnosis_date: new Date().toISOString(),
      created_by: user?.id,
    });

    setIcdCode('');
    setDescription('');
    setClinicalCategory('');
    setRank('');
    setClassification('');
    setIsAddDiagnosisOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Medical Diagnoses</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-8 w-8 p-0"
          >
            <Filter className="h-4 w-4" />
            <span className="sr-only">Toggle filters</span>
          </Button>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddDiagnosisOpen} onOpenChange={setIsAddDiagnosisOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Diagnosis
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Diagnosis</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="diagnosis-code">Diagnosis Code (ICD-10)</Label>
                    <Input
                      id="diagnosis-code"
                      placeholder="Enter ICD-10 code"
                      value={icdCode}
                      onChange={(e) => setIcdCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Diagnosis description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Clinical Category</Label>
                    <Select value={clinicalCategory} onValueChange={setClinicalCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select clinical category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medical Management">Medical Management</SelectItem>
                        <SelectItem value="Acute Neurologic">Acute Neurologic</SelectItem>
                        <SelectItem value="Acute Infections">Acute Infections</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rank">Rank</Label>
                    <Select value={rank} onValueChange={setRank}>
                      <SelectTrigger id="rank">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classification">Classification</Label>
                    <Select value={classification} onValueChange={setClassification}>
                      <SelectTrigger id="classification">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admission">Admission</SelectItem>
                        <SelectItem value="During Stay">During Stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDiagnosisOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDiagnosis} disabled={addDiagnosis.isPending}>
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {showFilters && (
        <div className="p-4 bg-muted rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filter-code">Code</Label>
              <Input id="filter-code" placeholder="Filter by code" />
            </div>
            <div>
              <Label htmlFor="filter-category">Category</Label>
              <Select>
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="medical-management">Medical Management</SelectItem>
                  <SelectItem value="acute-neurologic">Acute Neurologic</SelectItem>
                  <SelectItem value="acute-infections">Acute Infections</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-classification">Classification</Label>
              <Select>
                <SelectTrigger id="filter-classification">
                  <SelectValue placeholder="All classifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classifications</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="during-stay">During Stay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm">Apply Filters</Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Clinical Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Created Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diagnoses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No diagnoses recorded
                </TableCell>
              </TableRow>
            ) : (
              diagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell>{diagnosis.icd_code}</TableCell>
                  <TableCell>{diagnosis.description}</TableCell>
                  <TableCell>{diagnosis.clinical_category || '-'}</TableCell>
                  <TableCell>{diagnosis.diagnosis_date ? format(new Date(diagnosis.diagnosis_date), 'M/d/yyyy') : '-'}</TableCell>
                  <TableCell>{diagnosis.diagnosis_rank || '-'}</TableCell>
                  <TableCell>{diagnosis.classification || '-'}</TableCell>
                  <TableCell>{diagnosis.created_at ? format(new Date(diagnosis.created_at), 'M/d/yyyy') : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default MedicalDiagnosesTab;
