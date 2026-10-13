import L from 'leaflet';
import { Marker } from 'react-leaflet';
import type { ClusterType } from '@/types/dashboard';
import { CLUSTER_INFO } from '@/types/dashboard';

interface ClusterMarkerProps {
  position: [number, number];
  clusterType: ClusterType;
}

export function ClusterMarker({ position, clusterType }: ClusterMarkerProps) {
  const info = CLUSTER_INFO[clusterType];

  const icon = L.divIcon({
    className: 'cluster-marker-icon',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${info.color};
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px ${info.color}40;
        font-size: 10px;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return <Marker position={position} icon={icon} />;
}
