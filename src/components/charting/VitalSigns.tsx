
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VitalSignsProps {
  patientId: string | null;
  patientName: string;
  vitalSigns: any[];
}

const VitalSigns: React.FC<VitalSignsProps> = ({ patientId, patientName, vitalSigns }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs for {patientName}</CardTitle>
        </CardHeader>
        <CardContent>
          {vitalSigns && vitalSigns.length > 0 ? (
            <div className="space-y-4">
              {vitalSigns.map((vital, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vital.temperature && (
                      <div>
                        <p className="text-sm font-medium">Temperature</p>
                        <p className="text-sm text-muted-foreground">{vital.temperature}°F</p>
                      </div>
                    )}
                    {vital.blood_pressure && (
                      <div>
                        <p className="text-sm font-medium">Blood Pressure</p>
                        <p className="text-sm text-muted-foreground">{vital.blood_pressure}</p>
                      </div>
                    )}
                    {vital.heart_rate && (
                      <div>
                        <p className="text-sm font-medium">Heart Rate</p>
                        <p className="text-sm text-muted-foreground">{vital.heart_rate} bpm</p>
                      </div>
                    )}
                    {vital.oxygen_saturation && (
                      <div>
                        <p className="text-sm font-medium">O2 Saturation</p>
                        <p className="text-sm text-muted-foreground">{vital.oxygen_saturation}%</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recorded: {new Date(vital.date_recorded).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No vital signs recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VitalSigns;
