// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, Smartphone, Lock, Eye, Monitor, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SecuritySettings() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  // Register device and session on mount
  useEffect(() => {
    const registerDeviceAndSession = async () => {
      if (!user || !session) return;

      const deviceInfo = {
        user_agent: navigator.userAgent,
        device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.split(' ').pop() || 'Unknown',
        ip_address: null, // Would need backend service to get real IP
      };

      // Register or update device
      const { data: existingDevice } = await supabase
        .from('user_devices')
        .select('id')
        .eq('user_id', user.id)
        .eq('user_agent', deviceInfo.user_agent)
        .maybeSingle();

      let deviceId = existingDevice?.id;

      if (!existingDevice) {
        const { data: newDevice, error: deviceError } = await supabase
          .from('user_devices')
          .insert({
            user_id: user.id,
            ...deviceInfo,
            trusted: true,
            last_seen_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (deviceError) {
          console.error('Failed to register device:', deviceError);
          return;
        }
        deviceId = newDevice.id;
      } else {
        // Update last seen
        await supabase
          .from('user_devices')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', deviceId);
      }

      // Check if session already exists
      const sessionIdentifier = session.access_token.substring(0, 32);
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', sessionIdentifier)
        .maybeSingle();

      if (!existingSession) {
        // Register new session
        const { error: sessionError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            device_id: deviceId,
            session_id: sessionIdentifier,
            ip_address: null,
            location: null,
            created_at: new Date().toISOString(),
            expires_at: new Date(session.expires_at! * 1000).toISOString(),
            revoked: false,
          });

        if (sessionError) {
          console.error('Failed to register session:', sessionError);
        } else {
          queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
    };

    registerDeviceAndSession();
  }, [user?.id, session?.access_token]);

  // Fetch MFA settings
  const { data: mfaSettings } = useQuery({
    queryKey: ['mfa-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch devices
  const { data: devices = [] } = useQuery({
    queryKey: ['user-devices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch active sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['user-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*, user_devices(*)')
        .eq('user_id', user.id)
        .eq('revoked', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleMFA = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user) throw new Error('Not authenticated');
      
      if (mfaSettings) {
        const { error } = await supabase
          .from('user_mfa_settings')
          .update({ mfa_enabled: enabled })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_mfa_settings')
          .insert({
            user_id: user.id,
            mfa_enabled: enabled,
            mfa_method: 'authenticator'
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
      toast.success('MFA settings updated');
    },
  });

  const trustDevice = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('user_devices')
        .update({ trusted: true })
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast.success('Device trusted');
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .update({ revoked: true, revoked_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast.success('Session revoked');
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Advanced authentication and device management</p>
      </div>

      <Tabs defaultValue="mfa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="mfa-toggle" className="text-base font-medium">
                    Enable Multi-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Require a second verification method when signing in
                  </p>
                </div>
                <Switch
                  id="mfa-toggle"
                  checked={mfaSettings?.mfa_enabled || false}
                  onCheckedChange={(checked) => toggleMFA.mutate(checked)}
                />
              </div>

              {mfaSettings?.mfa_enabled && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">MFA Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <Smartphone className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">Authenticator App</div>
                          <div className="text-xs text-muted-foreground">
                            {mfaSettings.mfa_method === 'authenticator' ? 'Active' : 'Not configured'}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {mfaSettings.last_mfa_at && (
                    <div className="text-xs text-muted-foreground">
                      Last used: {format(new Date(mfaSettings.last_mfa_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Management
              </CardTitle>
              <CardDescription>Manage trusted devices and login locations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {devices.map((device: any) => (
                <div key={device.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4" />
                        <span className="font-medium">
                          {device.device_name || `${device.browser} on ${device.os}`}
                        </span>
                        {device.trusted && (
                          <Badge variant="secondary">Trusted</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {device.ip_address} • {device.device_type}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last seen: {format(new Date(device.last_seen_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    {!device.trusted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => trustDevice.mutate(device.id)}
                      >
                        Trust Device
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Monitor and manage your login sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Active</Badge>
                        {session.user_devices && (
                          <span className="text-sm font-medium">
                            {session.user_devices.device_name || session.user_devices.browser}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.ip_address}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Started: {format(new Date(session.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expires: {format(new Date(session.expires_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => revokeSession.mutate(session.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}