
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function MenuSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-menu-items');
      
      if (error) {
        toast.error('Failed to sync menu items', { description: error.message });
      } else {
        toast.success('Menu Items Synced', { 
          description: `Successfully ${data?.message || 'synced menu items'}` 
        });
        setLastSync(new Date().toLocaleString());
      }
    } catch (err) {
      toast.error('Error during sync', { description: String(err) });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Menu Item Synchronization</CardTitle>
          <CardDescription>
            Sync menu items from USFoods API to update available food items, prices, and nutritional information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastSync && (
            <p className="text-sm text-muted-foreground mb-4">
              Last synced: {lastSync}
            </p>
          )}
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? 'Syncing...' : 'Sync Menu Items'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
