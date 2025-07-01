import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  Pill, 
  Heart, 
  FileText, 
  Camera, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatientVital {
  id: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  pain_scale?: number;
  recorded_at: string;
  recorded_by: string;
}

interface MedicationOrder {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route?: string;
  start_date: string;
  end_date?: string;
  status: string;
  instructions?: string;
}

interface CarePlan {
  id: string;
  title: string;
  description?: string;
  goals: string[];
  interventions: string[];
  ai_generated: boolean;
  status: string;
  start_date: string;
  target_date?: string;
}

interface PointClickCareEHRProps {
  patientId: string;
}

export const PointClickCareEHR: React.FC<PointClickCareEHRProps> = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [vitals, setVitals] = useState<PatientVital[]>([]);
  const [medications, setMedications] = useState<MedicationOrder[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [isAddingVitals, setIsAddingVitals] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isGeneratingCarePlan, setIsGeneratingCarePlan] = useState(false);
  
  const [newVitals, setNewVitals] = useState({
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    pain_scale: ''
  });

  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      // Load vitals
      const { data: vitalsData } = await supabase
        .from('patient_vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      // Load medications
      const { data: medicationsData } = await supabase
        .from('medication_orders')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active');

      // Load care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active');

      setVitals(vitalsData || []);
      setMedications(medicationsData || []);
      setCarePlans(carePlansData || []);
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Failed to load patient data');
    }
  };

  const saveVitals = async () => {
    if (!user) return;

    try {
      const vitalsData = {
        patient_id: patientId,
        recorded_by: user.id,
        temperature: newVitals.temperature ? parseFloat(newVitals.temperature) : null,
        blood_pressure_systolic: newVitals.blood_pressure_systolic ? parseInt(newVitals.blood_pressure_systolic) : null,
        blood_pressure_diastolic: newVitals.blood_pressure_diastolic ? parseInt(newVitals.blood_pressure_diastolic) : null,
        heart_rate: newVitals.heart_rate ? parseInt(newVitals.heart_rate) : null,
        respiratory_rate: newVitals.respiratory_rate ? parseInt(newVitals.respiratory_rate) : null,
        oxygen_saturation: newVitals.oxygen_saturation ? parseFloat(newVitals.oxygen_saturation) : null,
        weight: newVitals.weight ? parseFloat(newVitals.weight) : null,
        height: newVitals.height ? parseFloat(newVitals.height) : null,
        pain_scale: newVitals.pain_scale ? parseInt(newVitals.pain_scale) : null,
      };

      const { error } = await supabase
        .from('patient_vitals')
        .insert(vitalsData);

      if (error) throw error;

      toast.success('Vitals recorded successfully');
      setIsAddingVitals(false);
      setNewVitals({
        temperature: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        pain_scale: ''
      });
      loadPatientData();
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast.error('Failed to save vitals');
    }
  };

  const saveMedication = async () => {
    if (!user) return;

    try {
      const medicationData = {
        patient_id: patientId,
        prescribed_by: user.id,
        medication_name: newMedication.medication_name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        route: newMedication.route,
        instructions: newMedication.instructions,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      const { error } = await supabase
        .from('medication_orders')
        .insert(medicationData);

      if (error) throw error;

      toast.success('Medication order created successfully');
      setIsAddingMedication(false);
      setNewMedication({
        medication_name: '',
        dosage: '',
        frequency: '',
        route: 'oral',
        instructions: ''
      });
      loadPatientData();
    } catch (error) {
      console.error('Error saving medication:', error);
      toast.error('Failed to save medication order');
    }
  };

  const generateAICarePlan = async () => {
    setIsGeneratingCarePlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-care-plan', {
        body: {
          patientId,
          symptoms: 'Based on recent vitals and medical history',
          medicalHistory: 'Comprehensive review needed',
          currentMedications: medications.map(m => m.medication_name).join(', ')
        }
      });

      if (error) throw error;

      toast.success('AI Care Plan generated successfully');
      loadPatientData();
    } catch (error) {
      console.error('Error generating care plan:', error);
      toast.error('Failed to generate AI care plan');
    } finally {
      setIsGeneratingCarePlan(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Header Section - PointClickCare Style */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Patient Chart</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Room: 101A</span>
                <span>•</span>
                <span>DOB: 01/15/1975</span>
                <span>•</span>
                <span>MRN: {patientId.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={generateAICarePlan} disabled={isGeneratingCarePlan}>
              <Brain className="h-4 w-4 mr-2" />
              {isGeneratingCarePlan ? 'Generating...' : 'AI Care Plan'}
            </Button>
            <Button variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Wound Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - PointClickCare Style */}
      <div className="bg-white border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent h-12 w-full justify-start rounded-none border-b-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="vitals" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Vitals
            </TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Medications
            </TabsTrigger>
            <TabsTrigger value="careplans" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Care Plans
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Assessments
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Latest Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vitals.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Temperature:</span>
                        <span className="font-medium">{vitals[0].temperature}°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blood Pressure:</span>
                        <span className="font-medium">{vitals[0].blood_pressure_systolic}/{vitals[0].blood_pressure_diastolic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heart Rate:</span>
                        <span className="font-medium">{vitals[0].heart_rate} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>O2 Sat:</span>
                        <span className="font-medium">{vitals[0].oxygen_saturation}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No vitals recorded</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-blue-500" />
                    Active Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medications.length > 0 ? (
                    <div className="space-y-2">
                      {medications.slice(0, 5).map((med) => (
                        <div key={med.id} className="text-sm">
                          <div className="font-medium">{med.medication_name}</div>
                          <div className="text-gray-600">{med.dosage} - {med.frequency}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No active medications</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-500" />
                    Care Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {carePlans.length > 0 ? (
                    <div className="space-y-2">
                      {carePlans.map((plan) => (
                        <div key={plan.id} className="text-sm">
                          <div className="font-medium">{plan.title}</div>
                          <Badge variant={plan.ai_generated ? "default" : "secondary"} className="text-xs">
                            {plan.ai_generated ? "AI Generated" : "Manual"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No active care plans</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Vital Signs</h2>
              <Button onClick={() => setIsAddingVitals(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vitals
              </Button>
            </div>

            {isAddingVitals && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Record Vital Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Temperature (°F)</label>
                      <Input
                        value={newVitals.temperature}
                        onChange={(e) => setNewVitals({...newVitals, temperature: e.target.value})}
                        placeholder="98.6"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Systolic BP</label>
                      <Input
                        value={newVitals.blood_pressure_systolic}
                        onChange={(e) => setNewVitals({...newVitals, blood_pressure_systolic: e.target.value})}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Diastolic BP</label>
                      <Input
                        value={newVitals.blood_pressure_diastolic}
                        onChange={(e) => setNewVitals({...newVitals, blood_pressure_diastolic: e.target.value})}
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Heart Rate (bpm)</label>
                      <Input
                        value={newVitals.heart_rate}
                        onChange={(e) => setNewVitals({...newVitals, heart_rate: e.target.value})}
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">O2 Saturation (%)</label>
                      <Input
                        value={newVitals.oxygen_saturation}
                        onChange={(e) => setNewVitals({...newVitals, oxygen_saturation: e.target.value})}
                        placeholder="98"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Pain Scale (0-10)</label>
                      <Input
                        value={newVitals.pain_scale}
                        onChange={(e) => setNewVitals({...newVitals, pain_scale: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button onClick={saveVitals}>Save Vitals</Button>
                    <Button variant="outline" onClick={() => setIsAddingVitals(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {vitals.map((vital) => (
                <Card key={vital.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{new Date(vital.recorded_at).toLocaleString()}</span>
                      <Badge variant="outline">Recorded by: {vital.recorded_by}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Temp:</span>
                        <span className="ml-2 font-medium">{vital.temperature}°F</span>
                      </div>
                      <div>
                        <span className="text-gray-600">BP:</span>
                        <span className="ml-2 font-medium">{vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">HR:</span>
                        <span className="ml-2 font-medium">{vital.heart_rate} bpm</span>
                      </div>
                      <div>
                        <span className="text-gray-600">O2:</span>
                        <span className="ml-2 font-medium">{vital.oxygen_saturation}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Medication Orders</h2>
              <Button onClick={() => setIsAddingMedication(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>

            {isAddingMedication && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>New Medication Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Medication Name</label>
                      <Input
                        value={newMedication.medication_name}
                        onChange={(e) => setNewMedication({...newMedication, medication_name: e.target.value})}
                        placeholder="Lisinopril"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Dosage</label>
                      <Input
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="10mg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Frequency</label>
                      <Input
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                        placeholder="Once daily"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Route</label>
                      <Input
                        value={newMedication.route}
                        onChange={(e) => setNewMedication({...newMedication, route: e.target.value})}
                        placeholder="Oral"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Instructions</label>
                    <Textarea
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                      placeholder="Take with food"
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button onClick={saveMedication}>Create Order</Button>
                    <Button variant="outline" onClick={() => setIsAddingMedication(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {medications.map((med) => (
                <Card key={med.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{med.medication_name}</h3>
                        <p className="text-gray-600">{med.dosage} - {med.frequency}</p>
                        {med.instructions && (
                          <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={med.status === 'active' ? 'default' : 'secondary'}>
                          {med.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">Started: {med.start_date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Care Plans Tab */}
          <TabsContent value="careplans" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Care Plans</h2>
              <Button onClick={generateAICarePlan} disabled={isGeneratingCarePlan}>
                <Brain className="h-4 w-4 mr-2" />
                {isGeneratingCarePlan ? 'Generating...' : 'Generate AI Care Plan'}
              </Button>
            </div>

            <div className="space-y-4">
              {carePlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{plan.title}</h3>
                        {plan.description && <p className="text-gray-600 mt-1">{plan.description}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={plan.ai_generated ? "default" : "secondary"}>
                          {plan.ai_generated ? "AI Generated" : "Manual"}
                        </Badge>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Goals</h4>
                        <ul className="space-y-1">
                          {plan.goals.map((goal, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Interventions</h4>
                        <ul className="space-y-1">
                          {plan.interventions.map((intervention, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              {intervention}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      <span>Start Date: {plan.start_date}</span>
                      {plan.target_date && <span> • Target Date: {plan.target_date}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs can be implemented similarly */}
          <TabsContent value="assessments" className="p-6">
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Wound Assessment & AI Analysis</h3>
              <p className="text-gray-600 mb-4">Upload wound images for AI-powered assessment and tracking</p>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="p-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Clinical Notes</h3>
              <p className="text-gray-600 mb-4">Document patient observations and care notes</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
