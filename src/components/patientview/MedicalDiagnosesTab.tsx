import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Plus, Filter } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface Diagnosis {
  code: string;
  description: string;
  pdpmComorbidities: string;
  clinicalCategory: string;
  date: string;
  rank: string;
  classification: string;
  createdDate: string;
  createdBy: string;
  [key: string]: any;
}

interface MedicalDiagnosesTabProps {
  patientId: string;
}

const MedicalDiagnosesTab: React.FC<MedicalDiagnosesTabProps> = ({ patientId }) => {
  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sample data based on the screenshot
  const diagnosesData: Diagnosis[] = [
    {
      code: 'L89.313',
      description: 'PRESSURE ULCER OF RIGHT BUTTOCK, STAGE 3',
      pdpmComorbidities: 'NTA POINTS',
      clinicalCategory: 'Medical Management',
      date: '9/17/2024',
      rank: 'Primary',
      classification: 'Admission',
      createdDate: '9/23/2024',
      createdBy: 'dawn.odie'
    },
    {
      code: 'L89.323',
      description: 'PRESSURE ULCER OF LEFT BUTTOCK, STAGE 3',
      pdpmComorbidities: '',
      clinicalCategory: 'Medical Management',
      date: '9/17/2024',
      rank: 'A',
      classification: 'Admission',
      createdDate: '9/23/2024',
      createdBy: 'dawn.odie'
    },
    {
      code: 'G82.21',
      description: 'PARAPLEGIA, COMPLETE',
      pdpmComorbidities: '',
      clinicalCategory: 'Acute Neurologic',
      date: '9/17/2024',
      rank: 'B',
      classification: 'Admission',
      createdDate: '9/23/2024',
      createdBy: 'dawn.odie'
    },
    {
      code: 'N31.9',
      description: 'NEUROMUSCULAR DYSFUNCTION OF BLADDER, UNSPECIFIED',
      pdpmComorbidities: '',
      clinicalCategory: 'Medical Management',
      date: '9/17/2024',
      rank: 'C',
      classification: 'Admission',
      createdDate: '9/23/2024',
      createdBy: 'dawn.odie'
    },
    {
      code: 'F20.9',
      description: 'SCHIZOPHRENIA, UNSPECIFIED',
      pdpmComorbidities: '',
      clinicalCategory: 'Medical Management',
      date: '12/2/2024',
      rank: 'D',
      classification: 'During Stay',
      createdDate: '12/4/2024',
      createdBy: 'dawn.odie'
    },
    {
      code: 'L03.211',
      description: 'CELLULITIS OF FACE',
      pdpmComorbidities: '',
      clinicalCategory: 'Acute Infections',
      date: '1/16/2025',
      rank: 'E',
      classification: 'During Stay',
      createdDate: '1/17/2025',
      createdBy: 'dawn.odie'
    },
    {
      code: 'F41.1',
      description: 'GENERALIZED ANXIETY DISORDER',
      pdpmComorbidities: '',
      clinicalCategory: 'N/A, not an acceptable Primary Diagnosis',
      date: '10/16/2024',
      rank: 'N/A',
      classification: '',
      createdDate: '10/16/2024',
      createdBy: 'jackson.edward'
    },
    {
      code: 'H10.9',
      description: 'UNSPECIFIED CONJUNCTIVITIS',
      pdpmComorbidities: '',
      clinicalCategory: '',
      date: '',
      rank: '',
      classification: '',
      createdDate: '',
      createdBy: ''
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(diagnosesData, 'medical-diagnoses');
  };

  const handleExportPdf = () => {
    exportToPdf('Medical Diagnoses Report', diagnosesData);
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
                    <Input id="diagnosis-code" placeholder="Enter ICD-10 code" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Diagnosis description" />
                  </div>
                  <div>
                    <Label htmlFor="category">Clinical Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select clinical category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical-management">Medical Management</SelectItem>
                        <SelectItem value="acute-neurologic">Acute Neurologic</SelectItem>
                        <SelectItem value="acute-infections">Acute Infections</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rank">Rank</Label>
                    <Select>
                      <SelectTrigger id="rank">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="d">D</SelectItem>
                        <SelectItem value="e">E</SelectItem>
                        <SelectItem value="f">F</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classification">Classification</Label>
                    <Select>
                      <SelectTrigger id="classification">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admission">Admission</SelectItem>
                        <SelectItem value="during-stay">During Stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDiagnosisOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>PDPM Comorbidities</TableHead>
            <TableHead>Clinical Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diagnosesData.map((diagnosis, index) => (
            <TableRow key={`${diagnosis.code}-${index}`}>
              <TableCell>{diagnosis.code}</TableCell>
              <TableCell>{diagnosis.description}</TableCell>
              <TableCell>{diagnosis.pdpmComorbidities}</TableCell>
              <TableCell>{diagnosis.clinicalCategory}</TableCell>
              <TableCell>{diagnosis.date}</TableCell>
              <TableCell>{diagnosis.rank}</TableCell>
              <TableCell>{diagnosis.classification}</TableCell>
              <TableCell>{diagnosis.createdDate}</TableCell>
              <TableCell>{diagnosis.createdBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MedicalDiagnosesTab;
