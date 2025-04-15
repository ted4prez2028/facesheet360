
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, Plus, Filter } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface VitalSign {
  vitalSign: string;
  recentValue: string;
  date: string;
  time: string;
  baseline?: string;
  recordedBy: string;
}

interface VitalsTabProps {
  patientId: string;
}

const VitalsTab: React.FC<VitalsTabProps> = ({ patientId }) => {
  const [isAddVitalOpen, setIsAddVitalOpen] = useState(false);
  
  // Sample data based on the screenshot
  const vitalsData: VitalSign[] = [
    {
      vitalSign: "Weight",
      recentValue: "196.6 Lbs",
      date: "4/1/2025",
      time: "09:09",
      baseline: "186.0 Lbs",
      recordedBy: "michell.zamora (Manual)"
    },
    {
      vitalSign: "Blood Pressure",
      recentValue: "128 / 81 mmHg",
      date: "4/7/2025",
      time: "07:18",
      baseline: "118 / 76 mmHg",
      recordedBy: "alexis.niece (Manual)"
    },
    {
      vitalSign: "Temperature",
      recentValue: "98.3 °F",
      date: "3/31/2025",
      time: "07:54",
      baseline: "97.3 °F",
      recordedBy: "alexis.niece (Manual)"
    },
    {
      vitalSign: "Pulse",
      recentValue: "95 bpm",
      date: "4/7/2025",
      time: "07:18",
      baseline: "95 bpm",
      recordedBy: "alexis.niece (Manual)"
    },
    {
      vitalSign: "Respirations",
      recentValue: "18 Breaths/min",
      date: "4/7/2025",
      time: "07:18",
      baseline: "18 Breaths/min",
      recordedBy: "alexis.niece (Manual)"
    },
    {
      vitalSign: "O2 Saturation",
      recentValue: "97.0%",
      date: "4/7/2025",
      time: "07:18",
      baseline: "96.0 %",
      recordedBy: "alexis.niece (Manual)"
    },
    {
      vitalSign: "Height",
      recentValue: "70.0 inches",
      date: "",
      time: "",
      baseline: "",
      recordedBy: ""
    },
    {
      vitalSign: "Pain Level",
      recentValue: "7",
      date: "4/15/2025",
      time: "11:33",
      baseline: "",
      recordedBy: "bethann.campbell (Manual)"
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(vitalsData, 'vital-signs');
  };

  const handleExportPdf = () => {
    exportToPdf('Vital Signs Report', vitalsData);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = ["2025", "2024", "2023"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <h2 className="text-lg font-semibold">Weights & Vitals</h2>
          <Select defaultValue="Apr">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month.substring(0, 3)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="2025">
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Dialog open={isAddVitalOpen} onOpenChange={setIsAddVitalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Vital Signs</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vital-type">Vital Sign</Label>
                    <Select>
                      <SelectTrigger id="vital-type">
                        <SelectValue placeholder="Select vital sign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight">Weight</SelectItem>
                        <SelectItem value="blood-pressure">Blood Pressure</SelectItem>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="pulse">Pulse</SelectItem>
                        <SelectItem value="respirations">Respirations</SelectItem>
                        <SelectItem value="o2-saturation">O2 Saturation</SelectItem>
                        <SelectItem value="height">Height</SelectItem>
                        <SelectItem value="pain">Pain Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" placeholder="Enter value" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" placeholder="Any additional notes" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddVitalOpen(false)}>Cancel</Button>
                <Button>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vital Sign</TableHead>
            <TableHead>Recent Monthly Value</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Baseline / Admission Value (Goal)</TableHead>
            <TableHead>Recorded By / Instrument</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vitalsData.map((vital, index) => (
            <TableRow key={index}>
              <TableCell>{vital.vitalSign}</TableCell>
              <TableCell>{vital.recentValue}</TableCell>
              <TableCell>{vital.date}</TableCell>
              <TableCell>{vital.time}</TableCell>
              <TableCell>{vital.baseline || '-'}</TableCell>
              <TableCell>{vital.recordedBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VitalsTab;
