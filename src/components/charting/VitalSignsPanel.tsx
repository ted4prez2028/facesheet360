
import React, { useState } from 'react';
import { useVitalSigns, useVitalSignsMutation } from '@/hooks/useChartData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Save, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/context/AuthContext';

interface VitalSignsFormValues {
  temperature: string;
  blood_pressure: string;
  heart_rate: string;
  respiratory_rate: string;
  oxygen_saturation: string;
  height: string;
  weight: string;
  notes: string;
}

interface VitalSignsPanelProps {
  patientId: string | null;
}

const VitalSignsPanel: React.FC<VitalSignsPanelProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('heart_rate');
  
  const initialValues: VitalSignsFormValues = {
    temperature: '',
    blood_pressure: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    height: '',
    weight: '',
    notes: ''
  };
  
  const [formValues, setFormValues] = useState<VitalSignsFormValues>(initialValues);
  
  const { data: vitalSigns, isLoading, refetch } = useVitalSigns(patientId);
  const { saveVitalSigns, isLoading: isSaving } = useVitalSignsMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !user?.id) {
      toast({
        title: "Error",
        description: "Patient ID or provider ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await saveVitalSigns({
        patient_id: patientId,
        date_recorded: new Date().toISOString(),
        temperature: formValues.temperature ? parseFloat(formValues.temperature) : undefined,
        blood_pressure: formValues.blood_pressure || undefined,
        heart_rate: formValues.heart_rate ? parseInt(formValues.heart_rate) : undefined,
        respiratory_rate: formValues.respiratory_rate ? parseInt(formValues.respiratory_rate) : undefined,
        oxygen_saturation: formValues.oxygen_saturation ? parseFloat(formValues.oxygen_saturation) : undefined,
        height: formValues.height ? parseFloat(formValues.height) : undefined,
        weight: formValues.weight ? parseFloat(formValues.weight) : undefined,
        notes: formValues.notes || undefined
      });
      
      toast({
        title: "Success",
        description: "Vital signs recorded successfully"
      });
      
      setFormValues(initialValues);
      setIsAdding(false);
      refetch();

      // Mint CareCoins for the provider
      mintCareCoin(user.id, patientId, {
        vitalSigns: formValues,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vital signs",
        variant: "destructive"
      });
    }
  };

  interface VitalSignsChartData {
  vitalSigns: VitalSignsFormValues;
}

  const mintCareCoin = async (providerId: string, patientId: string, chartData: VitalSignsChartData) => {
    try {
      const response = await fetch("/api/mint-carecoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId, patientId, chartData }),
      });

      if (!response.ok) {
        throw new Error("Failed to mint CareCoins");
      }

      const data = await response.json();
      toast({
        title: "CareCoins Minted",
        description: `You have been awarded ${data.amount} CareCoins!`,
      });
    } catch (error) {
      console.error("Error minting CareCoins:", error);
      toast({
        title: "Minting Error",
        description: "Could not mint CareCoins at this time.",
        variant: "destructive",
      });
    }
  };

  const formatVitalSignsData = () => {
    if (!vitalSigns) return [];
    
    return vitalSigns.slice(0, 10).map(vs => ({
      date: format(new Date(vs.date_recorded), 'MM/dd'),
      heart_rate: vs.heart_rate,
      temperature: vs.temperature,
      oxygen_saturation: vs.oxygen_saturation,
      respiratory_rate: vs.respiratory_rate,
      systolic: vs.blood_pressure ? parseInt(vs.blood_pressure.split('/')[0]) : undefined,
      diastolic: vs.blood_pressure ? parseInt(vs.blood_pressure.split('/')[1]) : undefined,
    })).reverse();
  };

  const metricOptions = [
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', color: '#FF5722' },
    { value: 'temperature', label: 'Temperature', unit: '°C', color: '#2196F3' },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', color: '#4CAF50' },
    { value: 'respiratory_rate', label: 'Respiratory Rate', unit: 'bpm', color: '#9C27B0' },
    { value: 'systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', color: '#F44336' },
    { value: 'diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', color: '#3F51B5' },
  ];
  
  const selectedMetricInfo = metricOptions.find(m => m.value === selectedMetric);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-gray-500">Loading vital signs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Vital Signs</h3>
        {!isAdding && (
          <Button 
            className="gap-2 bg-health-600 hover:bg-health-700"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Activity className="h-4 w-4" />
            <span>Record Vitals</span>
          </Button>
        )}
      </div>
      
      {vitalSigns && vitalSigns.length > 0 && !isAdding && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vital Signs Trends</CardTitle>
            <CardDescription>Monitoring health patterns over time</CardDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              {metricOptions.map(option => (
                <Button 
                  key={option.value}
                  variant={selectedMetric === option.value ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedMetric(option.value)}
                  className={selectedMetric === option.value ? "bg-health-600 hover:bg-health-700" : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ChartContainer 
                config={{
                  [selectedMetric]: { color: selectedMetricInfo?.color || '#666' }
                }}
              >
                <LineChart data={formatVitalSignsData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    name={selectedMetricInfo?.label} 
                    unit={selectedMetricInfo?.unit}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record Vital Signs</CardTitle>
            <CardDescription>Enter the patient's current vital signs</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input 
                    id="temperature" 
                    name="temperature"
                    value={formValues.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 37.0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure (mmHg)</Label>
                  <Input 
                    id="blood_pressure" 
                    name="blood_pressure"
                    value={formValues.blood_pressure}
                    onChange={handleInputChange}
                    placeholder="e.g., 120/80"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input 
                    id="heart_rate" 
                    name="heart_rate"
                    value={formValues.heart_rate}
                    onChange={handleInputChange}
                    placeholder="e.g., 75"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="respiratory_rate">Respiratory Rate (breaths/min)</Label>
                  <Input 
                    id="respiratory_rate" 
                    name="respiratory_rate"
                    value={formValues.respiratory_rate}
                    onChange={handleInputChange}
                    placeholder="e.g., 16"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                  <Input 
                    id="oxygen_saturation" 
                    name="oxygen_saturation"
                    value={formValues.oxygen_saturation}
                    onChange={handleInputChange}
                    placeholder="e.g., 98"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    name="height"
                    value={formValues.height}
                    onChange={handleInputChange}
                    placeholder="e.g., 175"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    name="weight"
                    value={formValues.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 70"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes"
                  value={formValues.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional observations..."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-health-600 hover:bg-health-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Vitals
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          {vitalSigns && vitalSigns.length > 0 ? (
            vitalSigns.map((vs) => (
              <Card key={vs.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">Vital Signs</CardTitle>
                    <CardDescription>
                      {new Date(vs.date_recorded).toLocaleString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vs.temperature && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">Temperature:</span>
                        <span className="text-sm">{vs.temperature} °C</span>
                      </div>
                    )}
                    
                    {vs.blood_pressure && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium">BP:</span>
                        <span className="text-sm">{vs.blood_pressure} mmHg</span>
                      </div>
                    )}
                    
                    {vs.heart_rate && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm font-medium">HR:</span>
                        <span className="text-sm">{vs.heart_rate} bpm</span>
                      </div>
                    )}
                    
                    {vs.respiratory_rate && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-medium">RR:</span>
                        <span className="text-sm">{vs.respiratory_rate} breaths/min</span>
                      </div>
                    )}
                    
                    {vs.oxygen_saturation && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">O₂ Sat:</span>
                        <span className="text-sm">{vs.oxygen_saturation}%</span>
                      </div>
                    )}
                    
                    {vs.height && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                        <span className="text-sm font-medium">Height:</span>
                        <span className="text-sm">{vs.height} cm</span>
                      </div>
                    )}
                    
                    {vs.weight && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        <span className="text-sm font-medium">Weight:</span>
                        <span className="text-sm">{vs.weight} kg</span>
                      </div>
                    )}
                  </div>
                  
                  {vs.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm mt-1 text-gray-600">{vs.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Activity className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No vital signs recorded for this patient</p>
              <p className="text-sm mt-1">Click "Record Vitals" to add new data</p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default VitalSignsPanel;
