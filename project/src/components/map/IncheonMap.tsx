import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { ReactNode } from 'react';
import L from 'leaflet';
import type { AnalysisYear, BoundaryCollection } from '@/types/dashboard';
import { DongMapLabels } from '@/components/map/DongMapLabels';
import { useDashboardData } from '@/data/useDashboardData';
const INCHEON_CENTER: [number, number] = [37.4563, 126.7052];
const INCHEON_MAX_BOUNDS: [[number, number], [number, number]] = [
  [36.8, 124],
  [38, 127.5],
];
const MIN_ZOOM = 8;
const FALLBACK_ZOOM = 9;
const MAX_INITIAL_ZOOM = 9;
interface IncheonMapProps {
  children?: ReactNode;
  labelYear?: AnalysisYear;
}
export function IncheonMap({ children, labelYear = 2026 }: IncheonMapProps) {
  const { boundaries } = useDashboardData();
  return (
    <MapContainer
      center={INCHEON_CENTER}
      zoom={FALLBACK_ZOOM}
      minZoom={MIN_ZOOM}
      maxBounds={INCHEON_MAX_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      zoomControl
      attributionControl
    >
      {' '}
      <InitialIncheonView boundaries={boundaries} />{' '}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        className="incheon-muted-basemap"
      />{' '}
      <DongMapLabels year={labelYear} /> {children}{' '}
    </MapContainer>
  );
}
function InitialIncheonView({
  boundaries,
}: {
  boundaries: BoundaryCollection;
}) {
  const map = useMap();
  useEffect(() => {
    let disposed = false;
    let hasFitted = false;
    let frame = 0;
    const fitWhenSized = () => {
      if (disposed) return;
      map.invalidateSize({ pan: false, animate: false });
      const size = map.getSize();
      if (size.x <= 0 || size.y <= 0) return;
      const incheonBounds = L.geoJSON(boundaries).getBounds();
      if (!incheonBounds.isValid()) return;
      map.fitBounds(incheonBounds, {
        padding: [20, 20],
        maxZoom: MAX_INITIAL_ZOOM,
        animate: false,
      });
      hasFitted = true;
    };
    const scheduleInitialFit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(fitWhenSized);
      });
    };
    const observer = new ResizeObserver(() => {
      if (hasFitted) {
        map.invalidateSize({ pan: false, animate: false });
      } else {
        scheduleInitialFit();
      }
    });
    observer.observe(map.getContainer());
    map.whenReady(scheduleInitialFit);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [boundaries, map]);
  return null;
}
