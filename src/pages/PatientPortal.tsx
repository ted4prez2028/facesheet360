import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Heart, Pill, FileText, User, Bell, Video, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientPortal() {
  const { user } = useAuth();

  // Fetch patient portal access
  const { data: portalAccess } = useQuery({
    queryKey: ['portal-access', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_portal_users')
        .select('*, patients(*)')
        .eq('user_id', user?.id)
        .eq('active', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch upcoming appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['patient-appointments', portalAccess?.patient_id],
    queryFn: async () => {
      if (!portalAccess?.patient_id) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', portalAccess.patient_id)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!portalAccess,
  });

  // Fetch recent vitals
  const { data: vitals = [] } = useQuery({
    queryKey: ['patient-vitals', portalAccess?.patient_id],
    queryFn: async () => {
      if (!portalAccess?.patient_id) return [];
      const { data, error } = await supabase
        .from('patient_vitals')
        .select('*')
        .eq('patient_id', portalAccess.patient_id)
        .order('recorded_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!portalAccess,
  });

  if (!portalAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Portal Access Required</CardTitle>
            <CardDescription>
              Request access to view your health records and manage appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Request Portal Access</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Portal</h1>
          <p className="text-muted-foreground">
            Welcome, {portalAccess.patients?.first_name} {portalAccess.patients?.last_name}
          </p>
        </div>
        <Badge variant={portalAccess.verified ? 'default' : 'secondary'}>
          {portalAccess.verified ? 'Verified' : 'Pending Verification'}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex-col">
          <Calendar className="h-6 w-6 mb-2" />
          <span className="text-sm">Schedule Appointment</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col">
          <Pill className="h-6 w-6 mb-2" />
          <span className="text-sm">Refill Medications</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col">
          <Video className="h-6 w-6 mb-2" />
          <span className="text-sm">Virtual Visit</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col">
          <MessageSquare className="h-6 w-6 mb-2" />
          <span className="text-sm">Message Provider</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                ) : (
                  appointments.slice(0, 3).map((apt: any) => (
                    <div key={apt.id} className="border rounded-lg p-3">
                      <div className="font-medium">{apt.appointment_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(apt.scheduled_time), 'MMM d, yyyy h:mm a')}
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        {apt.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Recent Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vitals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent vitals recorded</p>
                ) : (
                  vitals.slice(0, 3).map((vital: any) => (
                    <div key={vital.id} className="border rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {vital.blood_pressure && (
                          <div>
                            <span className="text-muted-foreground">BP:</span> {vital.blood_pressure}
                          </div>
                        )}
                        {vital.heart_rate && (
                          <div>
                            <span className="text-muted-foreground">HR:</span> {vital.heart_rate} bpm
                          </div>
                        )}
                        {vital.temperature && (
                          <div>
                            <span className="text-muted-foreground">Temp:</span> {vital.temperature}°F
                          </div>
                        )}
                        {vital.oxygen_saturation && (
                          <div>
                            <span className="text-muted-foreground">O2:</span> {vital.oxygen_saturation}%
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {format(new Date(vital.recorded_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Appointment Management</p>
                <Button className="mt-4">Schedule New Appointment</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
              <CardDescription>Access your complete health history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Health Records</p>
                <p className="text-sm mt-2">View labs, imaging, and medical history</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>Current medications and refill requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Medication List</p>
                <Button className="mt-4">Request Refill</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}