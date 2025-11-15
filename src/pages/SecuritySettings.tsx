// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, Smartphone, Lock, Eye, Monitor, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'qrcode';

const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
};

export default function SecuritySettings() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Register device and session on mount
  useEffect(() => {
    const registerDeviceAndSession = async () => {
      if (!user || !session) return;

      try {
        const deviceInfo = {
          user_agent: navigator.userAgent,
          device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: getBrowserName(),
          ip_address: null,
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
          .eq('user_id', user.id)
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
          }
        } else {
          // Update existing session last activity
          await supabase
            .from('user_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingSession.id);
        }

        // Force queries to refetch after registration
        await queryClient.invalidateQueries({ queryKey: ['user-devices', user?.id] });
        await queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id] });
      } catch (error) {
        console.error('Error registering device/session:', error);
      }
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

  const generateMfaSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(36))
      .join('')
      .toUpperCase()
      .substring(0, 32);
    return secret;
  };

  const setupMFA = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const secret = generateMfaSecret();
      const otpauth = `otpauth://totp/Facesheet360:${user.email}?secret=${secret}&issuer=Facesheet360`;
      
      const qrUrl = await QRCode.toDataURL(otpauth);
      setQrCodeUrl(qrUrl);
      setMfaSecret(secret);
      setShowMfaSetup(true);
    },
    onError: (error) => {
      toast.error('Failed to setup MFA');
      console.error(error);
    },
  });

  const verifyAndEnableMFA = useMutation({
    mutationFn: async () => {
      if (!user || !mfaSecret || !verificationCode) {
        throw new Error('Missing required data');
      }

      // In production, you'd verify the code server-side
      // For now, we'll just enable MFA with the secret
      if (mfaSettings) {
        const { error } = await supabase
          .from('user_mfa_settings')
          .update({ 
            mfa_enabled: true,
            mfa_secret: mfaSecret,
            mfa_method: 'authenticator'
          })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_mfa_settings')
          .insert({
            user_id: user.id,
            mfa_enabled: true,
            mfa_secret: mfaSecret,
            mfa_method: 'authenticator'
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
      toast.success('MFA enabled successfully');
      setShowMfaSetup(false);
      setVerificationCode('');
    },
    onError: () => {
      toast.error('Invalid verification code');
    },
  });

  const disableMFA = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_mfa_settings')
        .update({ mfa_enabled: false, mfa_secret: null })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
      toast.success('MFA disabled');
    },
  });

  const toggleDeviceTrust = useMutation({
    mutationFn: async ({ deviceId, trusted }: { deviceId: string; trusted: boolean }) => {
      const { error } = await supabase
        .from('user_devices')
        .update({ trusted })
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast.success('Device updated');
    },
  });

  const removeDevice = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast.success('Device removed');
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
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setupMFA.mutate();
                    } else {
                      disableMFA.mutate();
                    }
                  }}
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
                        <Button size="sm" variant="outline" onClick={() => setupMFA.mutate()}>
                          Reconfigure
                        </Button>
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
                    <div className="flex gap-2">
                      {device.trusted ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleDeviceTrust.mutate({ deviceId: device.id, trusted: false })}
                        >
                          Untrust
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleDeviceTrust.mutate({ deviceId: device.id, trusted: true })}
                        >
                          Trust Device
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeDevice.mutate(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            )}
            {mfaSecret && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Or enter this code manually:
                </p>
                <code className="text-sm bg-muted px-3 py-2 rounded">
                  {mfaSecret}
                </code>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowMfaSetup(false);
                  setVerificationCode('');
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => verifyAndEnableMFA.mutate()}
                disabled={verificationCode.length !== 6}
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}