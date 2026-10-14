import { useMemo, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getFeatureCentroid } from '@/data/geoJsonLoader';
import { useDashboardData } from '@/data/useDashboardData';
import {
  has2016PopulationData,
  type AnalysisYear,
  type BoundaryFeature,
} from '@/types/dashboard';
import { escapeHtml, formatPercent, formatSignedPercent } from '@/utils/format';
const MIN_LABEL_WIDTH = 40;
const MIN_LABEL_AREA = 360;
const LABEL_GAP = 4;
interface DongMapLabelsProps {
  year: AnalysisYear;
}
interface LabelCandidate {
  code: string;
  name: string;
  ratio: number | null;
  position: [number, number];
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number;
  fontSize: number;
}
export function DongMapLabels({ year }: DongMapLabelsProps) {
  const map = useMap();
  const { boundaries, byCode } = useDashboardData();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const visibleLabels = useMemo(() => {
    const candidates: LabelCandidate[] = [];
    const fontSize = Math.max(11, Math.min(13, 11 + zoom - 8));
    for (const feature of boundaries.features) {
      const record = byCode[feature.properties.adm_cd];
      const bounds = getCoordinateBounds(feature);
      if (!record || !bounds) continue;
      const [[minLongitude, minLatitude], [maxLongitude, maxLatitude]] = bounds;
      const northwest = map.project([maxLatitude, minLongitude], zoom);
      const southeast = map.project([minLatitude, maxLongitude], zoom);
      const width = Math.abs(southeast.x - northwest.x) * 0.82;
      const height = Math.abs(southeast.y - northwest.y) * 0.82;
      if (width < MIN_LABEL_WIDTH || width * height < MIN_LABEL_AREA) continue;
      const position = getFeatureCentroid(feature);
      const point = map.project(position, zoom);
      const labelWidth = Math.min(width, 140);
      const labelHeight = fontSize * 2.5 + 4;
      const ratio =
        year === 2016
          ? record.history.eld_ratio_2016
          : year === 2021
            ? record.history.eld_ratio_2021
            : year === 2026
              ? record.eld_ratio
              : record.history.eld_gr_26_31;
      candidates.push({
        code: record.adm_cd,
        name: record.adm_nm,
        ratio: year === 2016 && !has2016PopulationData(record) ? null : ratio,
        position,
        x: point.x,
        y: point.y,
        width: labelWidth,
        height: labelHeight,
        priority: width * height,
        fontSize,
      });
    }
    candidates.sort(
      (a, b) => b.priority - a.priority || a.code.localeCompare(b.code),
    );
    const accepted: LabelCandidate[] = [];
    for (const candidate of candidates) {
      const overlaps = accepted.some(
        (existing) =>
          Math.abs(candidate.x - existing.x) <
            (candidate.width + existing.width) / 2 + LABEL_GAP &&
          Math.abs(candidate.y - existing.y) <
            (candidate.height + existing.height) / 2 + LABEL_GAP,
      );
      if (!overlaps) accepted.push(candidate);
    }
    return accepted;
  }, [boundaries, byCode, map, year, zoom]);
  return visibleLabels.map((label) => {
    const displayedValue =
      year === 2016 && label.ratio === null
        ? '2016 자료 없음'
        : year === 2031
          ? formatSignedPercent(label.ratio)
          : formatPercent(label.ratio);
    const icon = L.divIcon({
      className: 'dong-map-label-marker',
      html: `<span style="--dong-label-font-size:${label.fontSize}px;--dong-label-width:${label.width}px"><span class="dong-map-label-name">${escapeHtml(label.name)}</span><span class="dong-map-label-ratio">(${displayedValue})</span></span>`,
      iconSize: [label.width, label.height],
      iconAnchor: [label.width / 2, label.height / 2],
    });
    return (
      <Marker
        key={label.code}
        position={label.position}
        icon={icon}
        interactive={false}
        bubblingMouseEvents={false}
        keyboard={false}
      />
    );
  });
}
function getCoordinateBounds(
  feature: BoundaryFeature,
): [[number, number], [number, number]] | null {
  let minLongitude = Number.POSITIVE_INFINITY;
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;
  const visit = (coordinates: unknown): void => {
    if (!Array.isArray(coordinates)) return;
    if (
      coordinates.length >= 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      const [longitude, latitude] = coordinates;
      minLongitude = Math.min(minLongitude, longitude);
      minLatitude = Math.min(minLatitude, latitude);
      maxLongitude = Math.max(maxLongitude, longitude);
      maxLatitude = Math.max(maxLatitude, latitude);
      return;
    }
    coordinates.forEach(visit);
  };
  visit(feature.geometry.coordinates);
  if (!Number.isFinite(minLongitude)) return null;
  return [
    [minLongitude, minLatitude],
    [maxLongitude, maxLatitude],
  ];
}
