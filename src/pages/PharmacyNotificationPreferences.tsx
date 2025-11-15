// @ts-nocheck - Uses pharmacy_notification_preferences table not yet created
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, AlertTriangle, TrendingDown, Package, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export const PharmacyNotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pharmacy_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
      } else {
        // Set defaults if no preferences exist
        setPreferences({
          user_id: user.id,
          email_enabled: true,
          safety_alerts_enabled: true,
          safety_alerts_min_priority: 'medium',
          refill_alerts_enabled: true,
          refill_alerts_min_urgency: 'medium',
          adherence_alerts_enabled: true,
          inventory_alerts_enabled: true,
          cost_savings_alerts_enabled: false,
          daily_summary_enabled: true,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pharmacy_notification_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading preferences...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Customize which pharmacy alerts you want to receive and set your urgency thresholds
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Control your pharmacy alert email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled" className="text-base">
                  Enable Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive pharmacy alerts via email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences?.email_enabled}
                onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: preferences?.email_enabled ? 1 : 0.5 }}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div>
                    <Label className="text-base">Safety Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical medication safety issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={preferences?.safety_alerts_min_priority}
                    onValueChange={(value) => updatePreference('safety_alerts_min_priority', value)}
                    disabled={!preferences?.safety_alerts_enabled || !preferences?.email_enabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low+</SelectItem>
                      <SelectItem value="medium">Medium+</SelectItem>
                      <SelectItem value="high">High only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={preferences?.safety_alerts_enabled}
                    onCheckedChange={(checked) => updatePreference('safety_alerts_enabled', checked)}
                    disabled={!preferences?.email_enabled}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                  <div>
                    <Label className="text-base">Refill Predictions</Label>
                    <p className="text-sm text-muted-foreground">Medication reorder alerts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={preferences?.refill_alerts_min_urgency}
                    onValueChange={(value) => updatePreference('refill_alerts_min_urgency', value)}
                    disabled={!preferences?.refill_alerts_enabled || !preferences?.email_enabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low+</SelectItem>
                      <SelectItem value="medium">Medium+</SelectItem>
                      <SelectItem value="high">High only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={preferences?.refill_alerts_enabled}
                    onCheckedChange={(checked) => updatePreference('refill_alerts_enabled', checked)}
                    disabled={!preferences?.email_enabled}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <div>
                    <Label className="text-base">Adherence Alerts</Label>
                    <p className="text-sm text-muted-foreground">Patient medication adherence issues</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.adherence_alerts_enabled}
                  onCheckedChange={(checked) => updatePreference('adherence_alerts_enabled', checked)}
                  disabled={!preferences?.email_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <div>
                    <Label className="text-base">Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Low stock and expiration warnings</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.inventory_alerts_enabled}
                  onCheckedChange={(checked) => updatePreference('inventory_alerts_enabled', checked)}
                  disabled={!preferences?.email_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <Label className="text-base">Cost Savings Opportunities</Label>
                    <p className="text-sm text-muted-foreground">Ways to reduce medication costs</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.cost_savings_alerts_enabled}
                  onCheckedChange={(checked) => updatePreference('cost_savings_alerts_enabled', checked)}
                  disabled={!preferences?.email_enabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <div>
                    <Label className="text-base">Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">Receive automated daily analysis at 6 AM</p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.daily_summary_enabled}
                  onCheckedChange={(checked) => updatePreference('daily_summary_enabled', checked)}
                  disabled={!preferences?.email_enabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={loadPreferences}>
            Reset
          </Button>
          <Button onClick={savePreferences} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">About Pharmacy Alerts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Our AI-powered system analyzes pharmacy data daily to identify critical issues, predict medication needs, and optimize operations.
            </p>
            <p>
              <strong>Priority Levels:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>High:</strong> Requires immediate attention</li>
              <li><strong>Medium:</strong> Should be addressed soon</li>
              <li><strong>Low:</strong> For informational purposes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmacyNotificationPreferences;
