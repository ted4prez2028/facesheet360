
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LabResultsProps {
  patientId: string | null;
  labResults: any[];
}

const LabResults: React.FC<LabResultsProps> = ({ patientId, labResults }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          {labResults && labResults.length > 0 ? (
            <div className="space-y-4">
              {labResults.map((result, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium">Test</p>
                      <p className="text-muted-foreground">{result.test_name}</p>
                    </div>
                    <div>
                      <p className="font-medium">Result</p>
                      <p className="text-muted-foreground">{result.result}</p>
                    </div>
                    <div>
                      <p className="font-medium">Reference Range</p>
                      <p className="text-muted-foreground">{result.reference_range}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Date: {new Date(result.date_collected).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No lab results available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabResults;
