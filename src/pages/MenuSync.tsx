
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function MenuSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-menu-items');
      
      if (error) {
        toast.error('Failed to sync menu items', { description: error.message });
      } else {
        toast.success('Menu Items Synced', { 
          description: `Synced ${data?.message || 'some'} menu items` 
        });
      }
    } catch (err) {
      toast.error('Error during sync', { description: String(err) });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Menu Item Synchronization</h1>
      <Button 
        onClick={handleSync} 
        disabled={isSyncing}
        className="w-full"
      >
        {isSyncing ? 'Syncing...' : 'Sync Menu Items'}
      </Button>
    </div>
  );
}
