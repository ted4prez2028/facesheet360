
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Patient } from '@/types';
import { useCarePlans } from '@/hooks/useCarePlans';
import { useHealthPredictions } from '@/hooks/useHealthPredictions';
import { 
  User, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  Pill, 
  Brain,
  Shield,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';

interface PatientOverviewProps {
  patient: Patient | undefined;
  patientName: string;
  chartData: any;
}

const PatientOverview: React.FC<PatientOverviewProps> = ({ patient, patientName, chartData }) => {
  const { data: carePlans } = useCarePlans(patient?.id);
  const { predictions } = useHealthPredictions(patient?.id);

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const activeCarePlans = carePlans?.filter(plan => plan.status === 'active') || [];
  const aiGeneratedPlans = carePlans?.filter(plan => plan.is_ai_generated) || [];
  const highRiskPredictions = predictions?.filter(p => (p.prediction_data as any)?.risk_score > 0.7) || [];

  return (
    <div className="space-y-6">
      {/* Patient Demographics & Key Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Demographics & Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base font-semibold">{patientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p className="text-base font-semibold">{calculateAge(patient.date_of_birth)} years old</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-base font-semibold">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-base">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">MRN</p>
                <p className="text-base font-mono">{patient.medical_record_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="text-base">{patient.phone || 'Not provided'}</p>
              </div>
            </div>

            {patient.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-base">{patient.address}</p>
              </div>
            )}

            {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                <p className="text-base">
                  {patient.emergency_contact_name} {patient.emergency_contact_relation && `(${patient.emergency_contact_relation})`}
                </p>
                {patient.emergency_contact_phone && (
                  <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                )}
              </div>
            )}

            {(patient.insurance_provider || patient.insurance_number) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insurance Information</p>
                <p className="text-base">{patient.insurance_provider}</p>
                {patient.insurance_number && (
                  <p className="text-sm font-mono text-muted-foreground">{patient.insurance_number}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Health Score</span>
                <Badge variant="secondary">Good</Badge>
              </div>
              <Progress value={75} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Assessment</span>
                <Badge variant={highRiskPredictions.length > 0 ? "destructive" : "default"}>
                  {highRiskPredictions.length > 0 ? "High Risk" : "Low Risk"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Care Plan Status</span>
                <Badge variant={activeCarePlans.length > 0 ? "default" : "secondary"}>
                  {activeCarePlans.length} Active
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Vitals: Normal</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Pill className="h-4 w-4 text-blue-500" />
                <span>Medications: {patient.medications ? 'Active' : 'None'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>Last Visit: Recent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical History & Allergies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patient.medical_history && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{patient.medical_history}</p>
            </CardContent>
          </Card>
        )}

        {patient.allergies && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Allergies & Sensitivities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.allergies.split(',').map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {allergy.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Health Insights */}
      {predictions && predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Health Insights & Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">
                      {prediction.prediction_type.replace('_', ' ')} Risk
                    </h4>
                    <Badge variant={
                      (prediction.prediction_data as any)?.risk_score > 0.7 ? "destructive" :
                      (prediction.prediction_data as any)?.risk_score > 0.4 ? "default" : "secondary"
                    }>
                      {Math.round(((prediction.prediction_data as any)?.risk_score || 0) * 100)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={((prediction.prediction_data as any)?.risk_score || 0) * 100} 
                    className="h-2 mb-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Confidence: {Math.round(prediction.confidence_score * 100)}%
                  </p>
                  {(prediction.prediction_data as any)?.factors && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Risk Factors:</p>
                      <div className="flex flex-wrap gap-1">
                        {((prediction.prediction_data as any)?.factors as string[]).map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Generated Care Plans */}
      {aiGeneratedPlans && aiGeneratedPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI-Generated Care Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiGeneratedPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{plan.content}</pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Medications */}
      {patient.medications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{patient.medications}</p>
          </CardContent>
        </Card>
      )}

      {/* Clinical Notes */}
      {patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{patient.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientOverview;
