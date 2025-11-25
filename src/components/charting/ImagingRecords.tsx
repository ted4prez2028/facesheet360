
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagingRecord } from '@/types';

interface ImagingRecordsProps {
  patientId: string | null;
  imagingRecords: ImagingRecord[];
}

const ImagingRecords: React.FC<ImagingRecordsProps> = ({ patientId, imagingRecords }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imaging Records</CardTitle>
        </CardHeader>
        <CardContent>
          {imagingRecords && imagingRecords.length > 0 ? (
            <div className="space-y-4">
              {imagingRecords.map((record, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Study Type</p>
                      <p className="text-muted-foreground">{record.study_type}</p>
                    </div>
                    <div>
                      <p className="font-medium">Body Part</p>
                      <p className="text-muted-foreground">{record.body_part}</p>
                    </div>
                  </div>
                  {record.findings && (
                    <div className="mt-2">
                      <p className="font-medium">Findings</p>
                      <p className="text-muted-foreground">{record.findings}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Date: {new Date(record.study_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No imaging records available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagingRecords;
