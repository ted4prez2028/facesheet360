import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DriverLocation {
  driver_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface RealtimeDriverTrackerProps {
  driverId: string;
  driverName?: string;
}

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const RealtimeDriverTracker = ({ driverId, driverName }: RealtimeDriverTrackerProps) => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const map = useMap();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeTracking = async () => {
      // Fetch initial driver location
      const { data: driver } = await supabase
        .from('drivers')
        .select('current_latitude, current_longitude, status')
        .eq('id', driverId)
        .single();

      if (driver && driver.current_latitude && driver.current_longitude) {
        setDriverLocation({
          driver_id: driverId,
          latitude: driver.current_latitude,
          longitude: driver.current_longitude,
          timestamp: new Date().toISOString()
        });
        setIsOnline(driver.status === 'online');

        // Center map on driver
        map.setView([driver.current_latitude, driver.current_longitude], 15);
      }

      // Subscribe to real-time location updates via presence
      channel = supabase.channel(`driver-location:${driverId}`);

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const driverPresence = Object.values(state)[0] as any;
          
          if (driverPresence && driverPresence[0]) {
            const location = driverPresence[0];
            setDriverLocation({
              driver_id: driverId,
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: location.timestamp
            });
            setIsOnline(true);

            // Smoothly pan map to follow driver
            map.panTo([location.latitude, location.longitude], { animate: true, duration: 1 });
          }
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('Driver came online:', newPresences);
          setIsOnline(true);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('Driver went offline:', leftPresences);
          setIsOnline(false);
        })
        .subscribe();

      // Also subscribe to database changes for driver location updates
      const dbChannel = supabase
        .channel('driver-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'drivers',
            filter: `id=eq.${driverId}`
          },
          (payload) => {
            const updatedDriver = payload.new as any;
            if (updatedDriver.current_latitude && updatedDriver.current_longitude) {
              setDriverLocation({
                driver_id: driverId,
                latitude: updatedDriver.current_latitude,
                longitude: updatedDriver.current_longitude,
                timestamp: new Date().toISOString()
              });
              setIsOnline(updatedDriver.status === 'online');

              // Smoothly pan map to follow driver
              map.panTo([updatedDriver.current_latitude, updatedDriver.current_longitude], {
                animate: true,
                duration: 1
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(dbChannel);
      };
    };

    setupRealtimeTracking();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [driverId, map]);

  if (!driverLocation) {
    return null;
  }

  return (
    <Marker position={[driverLocation.latitude, driverLocation.longitude]} icon={driverIcon}>
      <Popup>
        <div className="text-center">
          <div className="font-semibold">{driverName || 'Your Driver'}</div>
          <div className="text-xs text-muted-foreground">
            {isOnline ? (
              <span className="text-green-600 font-medium">● Online</span>
            ) : (
              <span className="text-gray-600">● Offline</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};