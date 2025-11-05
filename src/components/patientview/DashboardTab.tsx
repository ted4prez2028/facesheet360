import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatient } from '@/hooks/usePatient';
import { usePatientVitals } from '@/hooks/usePatientVitals';
import { useHealthPredictions } from '@/hooks/useHealthPredictions';
import { HealthPredictions } from '@/components/ai/HealthPredictions';
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Heart, Thermometer, Weight, TrendingUp, Brain, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AICareplanButton } from '@/components/care-plan/AICareplanButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardTabProps {
  patientId: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ patientId }) => {
  const { patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: vitals } = usePatientVitals(patientId);
  const { predictions } = useHealthPredictions(patientId);

  // Mock trending data for analytics
  const vitalsTrend = [
    { date: '1/1', bp: 120, hr: 72, temp: 98.6 },
    { date: '1/2', bp: 122, hr: 75, temp: 98.7 },
    { date: '1/3', bp: 118, hr: 70, temp: 98.5 },
    { date: '1/4', bp: 125, hr: 78, temp: 98.8 },
    { date: '1/5', bp: 121, hr: 73, temp: 98.6 },
    { date: '1/6', bp: 119, hr: 71, temp: 98.4 },
    { date: '1/7', bp: 123, hr: 76, temp: 98.7 },
  ];

  if (patientLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>;
  }

  if (!patient) {
    return <div className="text-center py-8 text-muted-foreground">Patient not found</div>;
  }

  // Calculate health score based on vitals and predictions
  const calculateHealthScore = () => {
    let score = 85;
    if (predictions && predictions.length > 0) {
      const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length;
      score = Math.round((1 - avgConfidence) * 100);
    }
    return score;
  };

  const healthScore = calculateHealthScore();
  const latestVitals = vitals?.[0];

  return (
    <div className="space-y-6">
      {/* AI Care Plan Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-xl">AI-Powered Care Plan</CardTitle>
                <CardDescription>Generate intelligent care recommendations</CardDescription>
              </div>
            </div>
            <AICareplanButton patient={patient} className="h-11" />
          </div>
        </CardHeader>
      </Card>

      {/* Health Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold">{healthScore}</span>
              <TrendingUp className={`h-6 w-6 ${healthScore > 80 ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <Progress value={healthScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{predictions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Active predictions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Age & Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Age</span>
                <span className="font-medium">
                  {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Gender</span>
                <Badge variant="outline">{patient.gender}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Trending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs Trend (7 Days)</CardTitle>
          <CardDescription>Blood pressure and heart rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={vitalsTrend}>
              <defs>
                <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Area type="monotone" dataKey="bp" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBp)" />
              <Area type="monotone" dataKey="hr" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorHr)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Current Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-100 text-red-700">
                <Thermometer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{latestVitals?.temperature || '98.6'}°F</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Pressure</p>
                <p className="text-2xl font-bold">
                  {latestVitals?.blood_pressure_systolic || 120}/{latestVitals?.blood_pressure_diastolic || 80}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 text-green-700">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heart Rate</p>
                <p className="text-2xl font-bold">{latestVitals?.heart_rate || 72} bpm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
                <Weight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">O2 Saturation</p>
                <p className="text-2xl font-bold">{latestVitals?.oxygen_saturation || 98}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Health Predictions */}
      {predictions && predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Health Risk Predictions</CardTitle>
            <CardDescription>Machine learning analysis of health trends</CardDescription>
          </CardHeader>
          <CardContent>
            <HealthPredictions patientId={patientId} />
          </CardContent>
        </Card>
      )}

      {/* Patient Information Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="font-medium">{patient.first_name} {patient.last_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">MRN</dt>
                <dd className="font-mono text-sm">{patient.medical_record_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">DOB</dt>
                <dd className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Room</dt>
                <dd className="font-medium">{patient.room_number || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="font-medium">{patient.phone || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="font-medium text-sm">{patient.email || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Emergency Contact</dt>
                <dd className="font-medium">{patient.emergency_contact_name || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Emergency Phone</dt>
                <dd className="font-medium">{patient.emergency_contact_phone || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;
