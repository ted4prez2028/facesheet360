
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface TasksTabProps {
  patientId: string;
}

const TasksTab: React.FC<TasksTabProps> = ({ patientId }) => {
  // Sample data
  const tasksData = [
    {
      id: 1,
      description: 'Amount Eaten (Oregon and Pacific Shores)',
      position: 'CNA',
      frequency: 'BRK-LUN-DIN-PRN',
      status: true
    },
    {
      id: 2,
      description: 'Amount Eaten PRN (Oregon and Pacific Shores)',
      position: 'CNA',
      frequency: '"As Necessary"',
      status: true
    },
    {
      id: 3,
      description: 'FLUID INTAKE',
      position: 'CNA',
      frequency: '"Every Shift"',
      status: true
    },
    {
      id: 4,
      description: 'Group Activities',
      position: 'CNA',
      frequency: '"As Necessary"',
      status: true
    },
    {
      id: 5,
      description: 'Height',
      position: 'ACTD, ACTA',
      frequency: '"As Necessary"',
      status: false
    },
    {
      id: 6,
      description: 'HS snacks',
      position: 'CNA, RNA',
      frequency: '"Every Shift"',
      status: true
    },
    {
      id: 7,
      description: 'Low Airloss Mattress',
      position: 'CNA, RNA',
      frequency: '"As Necessary"',
      status: true
    },
    {
      id: 8,
      description: 'One on One Visits',
      position: 'CNA, RNA',
      frequency: '"Every Shift"',
      status: true
    },
    {
      id: 9,
      description: 'Self-directed/Independent Activities',
      position: 'ACTD, ACTA',
      frequency: '"As Necessary"',
      status: true
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(tasksData, 'patient-tasks');
  };

  const handleExportPdf = () => {
    exportToPdf('Patient Tasks', tasksData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Tasks
          </Button>
          <Button size="sm" variant="outline">
            New Custom Tasks
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-4 items-center">
        <Checkbox id="show-resolved" />
        <label htmlFor="show-resolved">Show Resolved/Cancelled</label>
        
        <Checkbox id="show-focus" />
        <label htmlFor="show-focus">Show Related Focus</label>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Task Description</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksData.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox checked={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="w-3 h-5 bg-red-500 rounded-sm"></div>
                  </TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.position}</TableCell>
                  <TableCell>{task.frequency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Task Care Record</h3>
            <Button variant="outline" size="sm" className="w-full mb-2">Task Care Record</Button>
            <Button variant="outline" size="sm" className="w-full">Kardex</Button>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Task List</h3>
            <Button variant="outline" size="sm" className="w-full">View Triggered Items Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksTab;
