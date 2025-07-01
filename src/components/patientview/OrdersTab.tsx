import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileSpreadsheet, FileText, Plus, Filter } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface Order {
  order: string;
  directions: string;
  category: string;
  status: string;
  startDate: string;
  endDate?: string;
  revisionDate: string;
  [key: string]: any;
}

interface OrdersTabProps {
  patientId: string;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ patientId }) => {
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  
  // Sample data based on the screenshot
  const ordersData: Order[] = [
    {
      order: "Nicotine Mini Mouth/Throat Lozenge 4 MG (Nicotine Polacrilex)",
      directions: "Give 1 lozenge by mouth every 1 hours as needed for Nicotine",
      category: "Pharmacy",
      status: "Pending Confirmation",
      startDate: "4/15/2025 13:15",
      endDate: "4/15/2025",
      revisionDate: "4/15/2025"
    },
    {
      order: "Nicotine Patch 24 Hour 14 MG/24HR",
      directions: "Apply 14 mg transdermally one time a day for nicotine",
      category: "Pharmacy",
      status: "Pending Confirmation",
      startDate: "4/18/2025 07:00",
      endDate: "4/15/2025",
      revisionDate: "4/15/2025"
    },
    {
      order: "PT Clarification - Skilled PT 3x/wk x2 one time only for 2 Weeks",
      directions: "PT may include Ther Ex, Ther Act, Group, Neuromuscular Reeducation, Manual Therapy Techniques, Wheelchair management, and Gait Training for Dx M62.81 muscle weakness",
      category: "Other",
      status: "Active",
      startDate: "4/14/2025 13:07",
      endDate: "4/28/2025",
      revisionDate: "4/14/2025"
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(ordersData, 'patient-orders');
  };

  const handleExportPdf = () => {
    exportToPdf('Patient Orders Report', ordersData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Orders</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="order-name">Order</Label>
                  <Input id="order-name" placeholder="Enter order name" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="diet">Diet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="directions">Directions</Label>
                  <Textarea id="directions" placeholder="Enter detailed directions" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending Confirmation</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddOrderOpen(false)}>Cancel</Button>
                <Button>Submit Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Last Order Review: 4/6/2025</p>
          </div>
          <div>
            <p className="text-sm font-medium">Next Order Review: 5/6/2025</p>
          </div>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Directions</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Revision Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersData.map((order, index) => (
            <TableRow key={index}>
              <TableCell>{order.order}</TableCell>
              <TableCell>{order.directions}</TableCell>
              <TableCell>{order.category}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.startDate}</TableCell>
              <TableCell>{order.endDate || '-'}</TableCell>
              <TableCell>{order.revisionDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTab;
