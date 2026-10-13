import { MapContainer, TileLayer } from 'react-leaflet';
import type { ReactNode } from 'react';

const INCHEON_CENTER: [number, number] = [37.4563, 126.7052];
const INCHEON_ZOOM = 11;

interface IncheonMapProps {
  children?: ReactNode;
  zoom?: number;
}

export function IncheonMap({ children, zoom = INCHEON_ZOOM }: IncheonMapProps) {
  return (
    <MapContainer
      center={INCHEON_CENTER}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      zoomControl
      attributionControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {children}
    </MapContainer>
  );
}
