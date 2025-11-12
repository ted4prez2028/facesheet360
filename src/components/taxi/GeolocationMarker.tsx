import { useEffect, useState } from 'react';
import { Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'sonner';

// Create a custom blue icon for current location
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface GeolocationMarkerProps {
  onLocationFound?: (coords: [number, number]) => void;
  centerOnLocation?: boolean;
}

export const GeolocationMarker = ({ onLocationFound, centerOnLocation = true }: GeolocationMarkerProps) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const map = useMap();

  useEffect(() => {
    // Request geolocation permission
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (location) => {
        const coords: [number, number] = [
          location.coords.latitude,
          location.coords.longitude
        ];
        setPosition(coords);

        // Center map on user location if requested
        if (centerOnLocation && map) {
          map.setView(coords, 15, { animate: true });
        }

        // Call callback if provided
        if (onLocationFound) {
          onLocationFound(coords);
        }

        // Show success message only once
        if (!permissionGranted) {
          toast.success('Location found successfully');
          setPermissionGranted(true);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map, onLocationFound, centerOnLocation, permissionGranted]);

  if (!position) {
    return null;
  }

  return (
    <>
      <Marker position={position} icon={currentLocationIcon}>
        <Popup>
          <div className="text-center">
            <strong>Your Current Location</strong>
            <br />
            <span className="text-xs text-muted-foreground">
              Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
            </span>
          </div>
        </Popup>
      </Marker>
      
      {/* Add a circle to show accuracy */}
      <Circle
        center={position}
        radius={50}
        pathOptions={{
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          color: '#3b82f6',
          weight: 1,
          opacity: 0.3
        }}
      />
    </>
  );
};