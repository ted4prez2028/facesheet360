// @ts-nocheck
import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BarChart3, MapPin, TrendingUp, Clock, Star } from 'lucide-react';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CompletedRide {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  distance_km: number;
  driver_name: string;
  estimated_cost_carecoins: number;
  actual_pickup_time: string;
  actual_dropoff_time: string;
  driver_rating?: number;
}

const RouteLines = ({ rides }: { rides: CompletedRide[] }) => {
  const map = useMap();

  useEffect(() => {
    if (rides.length > 0) {
      const bounds = L.latLngBounds(
        rides.map(r => [r.pickup_latitude, r.pickup_longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [rides, map]);

  return null;
};

const getRouteColor = (index: number) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
};

export const RideHistoryMap = () => {
  const { user } = useAuth();

  const { data: rides = [], isLoading } = useQuery({
    queryKey: ['completed-rides', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('pickup_latitude', 'is', null)
        .not('pickup_longitude', 'is', null)
        .not('dropoff_latitude', 'is', null)
        .not('dropoff_longitude', 'is', null)
        .order('actual_dropoff_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as CompletedRide[];
    },
    enabled: !!user,
  });

  const totalRides = rides.length;
  const totalDistance = rides.reduce((sum, ride) => sum + (ride.distance_km || 0), 0);
  const totalCost = rides.reduce((sum, ride) => sum + (ride.estimated_cost_carecoins || 0), 0);
  const avgRating = rides.filter(r => r.driver_rating).length > 0
    ? rides.filter(r => r.driver_rating).reduce((sum, r) => sum + (r.driver_rating || 0), 0) / rides.filter(r => r.driver_rating).length
    : 0;

  const center: [number, number] = rides.length > 0
    ? [rides[0].pickup_latitude, rides[0].pickup_longitude]
    : [40.7128, -74.0060];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading ride history...</p>
        </CardContent>
      </Card>
    );
  }

  if (rides.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ride History Map
          </CardTitle>
          <CardDescription>No completed rides yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Total Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRides}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistance.toFixed(1)} km</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCost.toFixed(0)} CC</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ride History Map
          </CardTitle>
          <CardDescription>
            Past routes with color-coded paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapContainer
            center={center}
            zoom={12}
            className="h-[500px] w-full rounded-lg"
            style={{ zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {rides.map((ride, index) => {
              const color = getRouteColor(index);
              const pickupCoords: [number, number] = [ride.pickup_latitude, ride.pickup_longitude];
              const dropoffCoords: [number, number] = [ride.dropoff_latitude, ride.dropoff_longitude];

              return (
                <div key={ride.id}>
                  <Polyline
                    positions={[pickupCoords, dropoffCoords]}
                    pathOptions={{
                      color,
                      weight: 4,
                      opacity: 0.7
                    }}
                  />
                  <Marker position={pickupCoords}>
                    <Popup>
                      <div className="space-y-1">
                        <div className="font-semibold">Pickup</div>
                        <div className="text-sm">{ride.pickup_location}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(ride.actual_pickup_time), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={dropoffCoords}>
                    <Popup>
                      <div className="space-y-1">
                        <div className="font-semibold">Dropoff</div>
                        <div className="text-sm">{ride.dropoff_location}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(ride.actual_dropoff_time), 'MMM d, yyyy h:mm a')}
                        </div>
                        <Badge style={{ backgroundColor: color }}>
                          {ride.distance_km.toFixed(1)} km
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}

            <RouteLines rides={rides} />
          </MapContainer>
        </CardContent>
      </Card>

      {/* Ride List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rides</CardTitle>
          <CardDescription>Details of your past rides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rides.map((ride, index) => (
              <div key={ride.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getRouteColor(index) }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{ride.pickup_location} → {ride.dropoff_location}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(ride.actual_dropoff_time), 'MMM d, yyyy')} • {ride.distance_km.toFixed(1)} km
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{ride.estimated_cost_carecoins} CC</div>
                  {ride.driver_rating && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {ride.driver_rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};