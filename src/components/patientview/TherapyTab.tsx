
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface TherapyTabProps {
  patientId: string;
}

const TherapyTab: React.FC<TherapyTabProps> = ({ patientId }) => {
  // Sample data
  const upcomingAppointments = [
    {
      date: '4/15/2025',
      discipline: 'PT',
      duration: '0:15',
      time: '-'
    },
    {
      date: '4/17/2025',
      discipline: 'PT',
      duration: '0:15',
      time: '-'
    }
  ];
  
  const recentEncounters = [
    {
      date: '04/14/2025',
      discipline: 'PT',
      duration: '0:53',
      doc: 'EVAL TEN'
    }
  ];
  
  const therapyTeam = [
    {
      type: 'PT',
      name: 'Adrian Connolley',
      contact: '-'
    }
  ];
  
  const precautions = "(PT) Referrals for RA program and CNA training for PROM\n(Stage 3), paraplegia, GSW 2020, Pressure ulcer of L buttys";
  
  const medicalDiagnoses = [
    "F19.10 (PT) Other stimulant abuse, uncomplicated",
    "F20.9 (PT) Schizophrenia, unspecified",
    "G82.21 (PT) Paraplegia, complete",
    "L89.313 (PT) Pressure ulcer of right buttock, stage 3",
    "L89.323 (PT) Pressure ulcer of left buttock, stage 3"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Therapy</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Encounter
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="border rounded-md p-4 mb-6">
            <h3 className="font-medium mb-2">UPCOMING APPOINTMENTS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((appointment, index) => (
                  <TableRow key={index}>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.discipline}</TableCell>
                    <TableCell>{appointment.duration}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="border rounded-md p-4 mb-6">
            <h3 className="font-medium mb-2">RECENT ENCOUNTERS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Doc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEncounters.map((encounter, index) => (
                  <TableRow key={index}>
                    <TableCell>{encounter.date}</TableCell>
                    <TableCell>{encounter.discipline}</TableCell>
                    <TableCell>{encounter.duration}</TableCell>
                    <TableCell>{encounter.doc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">THERAPY TEAM</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {therapyTeam.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>{member.type}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="col-span-2">
          <div className="border rounded-md p-4 mb-6">
            <h3 className="font-medium mb-2">KEY INFORMATION</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-1">PRECAUTIONS</h4>
              <p className="whitespace-pre-line text-sm">{precautions}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-1">MEDICAL DIAGNOSES</h4>
              <ul className="text-sm space-y-1">
                {medicalDiagnoses.map((diagnosis, index) => (
                  <li key={index}>{diagnosis}</li>
                ))}
              </ul>
            </div>
            
            <h4 className="text-sm font-bold mb-1">TREATMENT DIAGNOSES</h4>
            <p className="text-muted-foreground text-sm">No treatment diagnoses found</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">OUTCOMES</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>SOC</TableHead>
                    <TableHead>Admit</TableHead>
                    <TableHead>Recent</TableHead>
                    <TableHead>D/C</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>NOMS</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">THERAPY PROJECTIONS</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target ARD</TableHead>
                    <TableHead>Target Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No Therapy Projections Found</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyTab;
