
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LabResult {
  id: string;
  test_name: string;
  test_result: string;
  normal_range?: string;
  units?: string;
  flagged?: boolean;
  date_performed: string;
}

interface LabResultsTableProps {
  labResults?: LabResult[];
}

export const LabResultsTable: React.FC<LabResultsTableProps> = ({ labResults = [] }) => {
  if (!labResults || labResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No lab results available for this patient.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Normal Range</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.test_name}</TableCell>
                <TableCell>{result.test_result}</TableCell>
                <TableCell>{result.normal_range || '-'}</TableCell>
                <TableCell>{result.units || '-'}</TableCell>
                <TableCell>
                  {result.flagged ? (
                    <Badge variant="destructive">Abnormal</Badge>
                  ) : (
                    <Badge variant="secondary">Normal</Badge>
                  )}
                </TableCell>
                <TableCell>{result.date_performed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
