import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// @ts-ignore - leaflet-routing-machine types are not fully compatible
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { GeolocationMarker } from './GeolocationMarker';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RoutingControlProps {
  pickupCoords: [number, number] | null;
  dropoffCoords: [number, number] | null;
  onRouteFound?: (distance: number, duration: number) => void;
}

const RoutingControl = ({ pickupCoords, dropoffCoords, onRouteFound }: RoutingControlProps) => {
  const map = useMap();

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) return;

    // @ts-ignore - leaflet-routing-machine extends L but types are not available
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickupCoords[0], pickupCoords[1]),
        L.latLng(dropoffCoords[0], dropoffCoords[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#3b82f6', opacity: 0.8, weight: 5 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      show: false,
      createMarker: () => null, // We'll use our own markers
    }).addTo(map);

    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      if (onRouteFound) {
        onRouteFound(route.summary.totalDistance, route.summary.totalTime);
      }
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, pickupCoords, dropoffCoords, onRouteFound]);

  return null;
};

interface RideMapProps {
  pickupCoords: [number, number] | null;
  dropoffCoords: [number, number] | null;
  driverCoords?: [number, number] | null;
  onRouteFound?: (distance: number, duration: number) => void;
  onCurrentLocationFound?: (coords: [number, number]) => void;
  showCurrentLocation?: boolean;
  className?: string;
}

export const RideMap = ({ 
  pickupCoords, 
  dropoffCoords, 
  driverCoords,
  onRouteFound,
  onCurrentLocationFound,
  showCurrentLocation = true,
  className = ''
}: RideMapProps) => {
  const center: [number, number] = pickupCoords || [40.7128, -74.0060]; // Default to NYC
  
  return (
    <MapContainer
      center={center}
      zoom={13}
      className={`h-[400px] w-full rounded-lg ${className}`}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {pickupCoords && (
        <Marker position={pickupCoords} icon={pickupIcon}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}
      
      {dropoffCoords && (
        <Marker position={dropoffCoords} icon={dropoffIcon}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      )}

      {driverCoords && (
        <Marker position={driverCoords}>
          <Popup>Driver Location</Popup>
        </Marker>
      )}

      {pickupCoords && dropoffCoords && (
        <RoutingControl 
          pickupCoords={pickupCoords} 
          dropoffCoords={dropoffCoords}
          onRouteFound={onRouteFound}
        />
      )}

      {showCurrentLocation && (
        <GeolocationMarker 
          onLocationFound={onCurrentLocationFound}
          centerOnLocation={!pickupCoords && !dropoffCoords}
        />
      )}
    </MapContainer>
  );
};
