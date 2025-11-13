import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BellOff, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationPreference {
  id: string;
  conversation_id?: string;
  group_id?: string;
  is_muted: boolean;
  muted_until?: string;
  name?: string;
}

interface NotificationPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadPreferences();
    }
  }, [isOpen, user?.id]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data: prefs, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Fetch names for conversations and groups
      const prefsWithNames = await Promise.all(
        (prefs || []).map(async (pref) => {
          let name = '';
          if (pref.conversation_id) {
            // Get conversation details
            const { data: conv } = await supabase
              .from('conversations')
              .select('participant_1_id, participant_2_id')
              .eq('id', pref.conversation_id)
              .single();

            if (conv) {
              const otherId = conv.participant_1_id === user?.id 
                ? conv.participant_2_id 
                : conv.participant_1_id;
              
              const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', otherId)
                .single();

              name = profile?.name || 'Unknown';
            }
          } else if (pref.group_id) {
            const { data: group } = await supabase
              .from('group_conversations')
              .select('name')
              .eq('id', pref.group_id)
              .single();

            name = group?.name || 'Unknown Group';
          }

          return { ...pref, name };
        })
      );

      setPreferences(prefsWithNames);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = async (prefId: string, currentMuted: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ 
          is_muted: !currentMuted,
          muted_until: null
        })
        .eq('id', prefId);

      if (error) throw error;

      setPreferences(prev =>
        prev.map(p => p.id === prefId ? { ...p, is_muted: !currentMuted, muted_until: undefined } : p)
      );

      toast.success(currentMuted ? 'Notifications enabled' : 'Notifications muted');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update notification preference');
    }
  };

  const setMuteDuration = async (prefId: string, hours: number) => {
    try {
      const mutedUntil = new Date();
      mutedUntil.setHours(mutedUntil.getHours() + hours);

      const { error } = await supabase
        .from('notification_preferences')
        .update({ 
          is_muted: true,
          muted_until: mutedUntil.toISOString()
        })
        .eq('id', prefId);

      if (error) throw error;

      setPreferences(prev =>
        prev.map(p => p.id === prefId 
          ? { ...p, is_muted: true, muted_until: mutedUntil.toISOString() } 
          : p
        )
      );

      toast.success(`Muted for ${hours} hours`);
    } catch (error) {
      console.error('Error setting mute duration:', error);
      toast.error('Failed to set mute duration');
    }
  };

  const formatMutedUntil = (mutedUntil?: string) => {
    if (!mutedUntil) return '';
    const date = new Date(mutedUntil);
    return `Until ${date.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
          <DialogDescription>
            Manage notifications for your conversations and groups
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : preferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No muted conversations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{pref.name}</p>
                    {pref.is_muted && pref.muted_until && (
                      <p className="text-xs text-muted-foreground">
                        {formatMutedUntil(pref.muted_until)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pref.is_muted && (
                      <Select
                        defaultValue="custom"
                        onValueChange={(value) => {
                          if (value !== 'custom') {
                            setMuteDuration(pref.id, parseInt(value));
                          }
                        }}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="24">1 day</SelectItem>
                          <SelectItem value="168">1 week</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Switch
                      checked={!pref.is_muted}
                      onCheckedChange={() => toggleMute(pref.id, pref.is_muted)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPreferences;
