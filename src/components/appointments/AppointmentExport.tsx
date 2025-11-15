import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  patientName: string;
  date: Date;
  type: string;
  status: string;
  duration: number;
  notes?: string;
}

interface AppointmentExportProps {
  appointments: Appointment[];
}

export function AppointmentExport({ appointments }: AppointmentExportProps) {
  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Patient', 'Type', 'Status', 'Duration (min)', 'Notes'];
    const rows = appointments.map(apt => [
      format(apt.date, 'yyyy-MM-dd'),
      format(apt.date, 'HH:mm'),
      apt.patientName,
      apt.type,
      apt.status,
      apt.duration.toString(),
      apt.notes || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${appointments.length} appointments`);
  };

  const exportToPDF = () => {
    toast.info('PDF export coming soon');
  };

  const exportToExcel = () => {
    toast.info('Excel export coming soon');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={appointments.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}