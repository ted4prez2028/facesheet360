
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImagingRecord {
  id: string;
  imaging_type: string;
  body_area: string;
  findings?: string;
  date_performed: string;
  image_url?: string;
}

interface ImagingTableProps {
  imaging?: ImagingRecord[];
}

export const ImagingTable: React.FC<ImagingTableProps> = ({ imaging = [] }) => {
  if (!imaging || imaging.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imaging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No imaging studies available for this patient.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imaging</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Body Area</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imaging.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.imaging_type}</TableCell>
                <TableCell>{record.body_area}</TableCell>
                <TableCell>{record.findings || '-'}</TableCell>
                <TableCell>{record.date_performed}</TableCell>
                <TableCell>
                  {record.image_url ? (
                    <a 
                      href={record.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Image
                    </a>
                  ) : (
                    'No image'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
