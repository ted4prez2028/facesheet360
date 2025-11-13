import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RideHistoryMap } from '@/components/taxi/RideHistoryMap';
import { FavoriteLocations } from '@/components/taxi/FavoriteLocations';

export default function RideHistory() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ride Management</h1>
        <p className="text-muted-foreground">View your ride history and manage favorite locations</p>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Ride History</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <RideHistoryMap />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoriteLocations />
        </TabsContent>
      </Tabs>
    </div>
  );
}