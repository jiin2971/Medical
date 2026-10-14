import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getFeatureCentroid } from '@/data/geoJsonLoader';
import { useDashboardData } from '@/data/useDashboardData';
import type {
  AnalysisYear,
  BoundaryFeature,
  DongRecord,
} from '@/types/dashboard';
import { has2016PopulationData } from '@/types/dashboard';

const GRID_CELL_SIZE = 4;
const SEARCH_RADIUS_METERS = 5500;
const MAX_SEARCH_RADIUS_METERS = 12000;
const GRADIENT_OPACITY = 0.62;
const EDGE_OPACITY_FLOOR = 0.4;
const COLOR_STOPS = [
  { value: 13.6285, color: '#27AE60' },
  { value: 23.3707, color: '#F1C40F' },
  { value: 28.2881, color: '#E67E22' },
  { value: 44.8061, color: '#E74C3C' },
] as const;
const BASELINE_BORDER_COLOR = '#475569';
const SCENARIO_BORDER_COLOR = '#B91C1C';

interface ElderlyRatioGradientProps {
  year: AnalysisYear;
}

interface SamplePoint {
  x: number;
  y: number;
  value: number;
  radiusCells: number;
}

interface CoordinateBounds {
  minLongitude: number;
  minLatitude: number;
  maxLongitude: number;
  maxLatitude: number;
}

export function ElderlyRatioGradient({ year }: ElderlyRatioGradientProps) {
  const map = useMap();
  const { boundaries, byCode } = useDashboardData();

  useEffect(() => {
    const paneName = 'elderly-ratio-raster-pane';
    const pane = map.getPane(paneName) ?? map.createPane(paneName);
    pane.style.zIndex = '450';
    pane.style.pointerEvents = 'none';
    const canvas = document.createElement('canvas');
    canvas.className = 'elderly-ratio-gradient';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      pointerEvents: 'none',
    });
    pane.appendChild(canvas);

    let frame = 0;
    let disposed = false;
    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        const size = map.getSize();
        if (size.x <= 0 || size.y <= 0) return;
        const origin = map.containerPointToLayerPoint([0, 0]);
        canvas.style.left = `${origin.x}px`;
        canvas.style.top = `${origin.y}px`;

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.round(size.x * pixelRatio);
        canvas.height = Math.round(size.y * pixelRatio);
        canvas.style.width = `${size.x}px`;
        canvas.style.height = `${size.y}px`;

        const metersPerPixel = map.distance(
          map.containerPointToLatLng([0, 0]),
          map.containerPointToLatLng([1, 0]),
        );
        const samples: SamplePoint[] = [];
        for (const feature of boundaries.features) {
          const record = byCode[feature.properties.adm_cd];
          const value = record ? elderlyRatioForYear(record, year) : null;
          if (value === null || !Number.isFinite(value)) continue;
          const [latitude, longitude] = getFeatureCentroid(feature);
          const point = map.latLngToLayerPoint([latitude, longitude]);
          const bounds = getCoordinateBounds(feature);
          const extentMeters = bounds
            ? map.distance(
                [bounds.maxLatitude, bounds.minLongitude],
                [bounds.minLatitude, bounds.maxLongitude],
              )
            : SEARCH_RADIUS_METERS;
          const radiusMeters = Math.min(
            MAX_SEARCH_RADIUS_METERS,
            Math.max(SEARCH_RADIUS_METERS, extentMeters * 0.42),
          );
          samples.push({
            x: (point.x - origin.x) / GRID_CELL_SIZE,
            y: (point.y - origin.y) / GRID_CELL_SIZE,
            value,
            radiusCells: Math.max(
              1,
              radiusMeters / metersPerPixel / GRID_CELL_SIZE,
            ),
          });
        }

        const bucketSize = Math.max(
          1,
          samples.reduce(
            (maximum, sample) => Math.max(maximum, sample.radiusCells),
            1,
          ),
        );
        const buckets = new Map<string, number[]>();
        samples.forEach((sample, index) => {
          const bucketX = Math.floor(sample.x / bucketSize);
          const bucketY = Math.floor(sample.y / bucketSize);
          const key = `${bucketX}:${bucketY}`;
          const bucket = buckets.get(key) ?? [];
          bucket.push(index);
          buckets.set(key, bucket);
        });

        const gridWidth = Math.max(1, Math.ceil(size.x / GRID_CELL_SIZE));
        const gridHeight = Math.max(1, Math.ceil(size.y / GRID_CELL_SIZE));
        const buffer = document.createElement('canvas');
        buffer.width = gridWidth;
        buffer.height = gridHeight;
        const bufferContext = buffer.getContext('2d');
        const context = canvas.getContext('2d');
        if (!bufferContext || !context) return;

        const image = bufferContext.createImageData(gridWidth, gridHeight);
        const colors = samples.map((sample) => interpolateColor(sample.value));
        for (let y = 0; y < gridHeight; y += 1) {
          for (let x = 0; x < gridWidth; x += 1) {
            const pixel = (y * gridWidth + x) * 4;
            let totalWeight = 0;
            let nearestFadeDistance = Number.POSITIVE_INFINITY;
            let red = 0;
            let green = 0;
            let blue = 0;
            const bucketX = Math.floor(x / bucketSize);
            const bucketY = Math.floor(y / bucketSize);
            for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
              for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                const bucket =
                  buckets.get(`${bucketX + offsetX}:${bucketY + offsetY}`) ??
                  [];
                for (const index of bucket) {
                  const sample = samples[index];
                  const dx = x - sample.x;
                  const dy = y - sample.y;
                  const distanceSquared = dx * dx + dy * dy;
                  if (distanceSquared > sample.radiusCells * sample.radiusCells)
                    continue;
                  nearestFadeDistance = Math.min(
                    nearestFadeDistance,
                    Math.sqrt(distanceSquared) / sample.radiusCells,
                  );
                  const weight = 1 / (distanceSquared + 1);
                  const color = colors[index];
                  totalWeight += weight;
                  red += color[0] * weight;
                  green += color[1] * weight;
                  blue += color[2] * weight;
                }
              }
            }
            if (totalWeight === 0) {
              image.data[pixel] = 0;
              image.data[pixel + 1] = 0;
              image.data[pixel + 2] = 0;
              image.data[pixel + 3] = 0;
              continue;
            }
            image.data[pixel] = red / totalWeight;
            image.data[pixel + 1] = green / totalWeight;
            image.data[pixel + 2] = blue / totalWeight;
            const radiusFade = Math.max(0, 1 - nearestFadeDistance);
            image.data[pixel + 3] = Math.round(
              255 *
                (EDGE_OPACITY_FLOOR + (1 - EDGE_OPACITY_FLOOR) * radiusFade),
            );
          }
        }
        bufferContext.putImageData(image, 0, 0);

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, size.x, size.y);
        context.save();
        const gradientBoundaries =
          year === 2016
            ? boundaries.features.filter((feature) => {
                const record = byCode[feature.properties.adm_cd];
                return record && has2016PopulationData(record);
              })
            : boundaries.features;
        traceBoundaries(context, map, gradientBoundaries, origin);
        context.clip('evenodd');
        context.globalAlpha = GRADIENT_OPACITY;
        context.imageSmoothingEnabled = true;
        context.drawImage(buffer, 0, 0, size.x, size.y);
        context.restore();
        drawBoundaryOutlines(
          context,
          map,
          boundaries.features,
          origin,
          byCode,
          year,
        );
        context.setTransform(1, 0, 0, 1, 0, 0);
      });
    };

    map.on('moveend zoomend resize', draw);
    draw();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      map.off('moveend zoomend resize', draw);
      canvas.remove();
    };
  }, [boundaries, byCode, map, year]);

  return null;
}

function elderlyRatioForYear(
  record: DongRecord,
  year: AnalysisYear,
): number | null {
  if (year === 2016) return record.history.eld_ratio_2016;
  if (year === 2021) return record.history.eld_ratio_2021;
  return record.eld_ratio;
}

function getCoordinateBounds(
  feature: BoundaryFeature,
): CoordinateBounds | null {
  const bounds: CoordinateBounds = {
    minLongitude: Number.POSITIVE_INFINITY,
    minLatitude: Number.POSITIVE_INFINITY,
    maxLongitude: Number.NEGATIVE_INFINITY,
    maxLatitude: Number.NEGATIVE_INFINITY,
  };
  const visit = (coordinates: unknown): void => {
    if (!Array.isArray(coordinates)) return;
    if (
      coordinates.length >= 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      const [longitude, latitude] = coordinates;
      bounds.minLongitude = Math.min(bounds.minLongitude, longitude);
      bounds.minLatitude = Math.min(bounds.minLatitude, latitude);
      bounds.maxLongitude = Math.max(bounds.maxLongitude, longitude);
      bounds.maxLatitude = Math.max(bounds.maxLatitude, latitude);
      return;
    }
    coordinates.forEach(visit);
  };
  visit(feature.geometry.coordinates);
  return Number.isFinite(bounds.minLongitude) ? bounds : null;
}

function traceBoundaries(
  context: CanvasRenderingContext2D,
  map: L.Map,
  features: BoundaryFeature[],
  origin: L.Point,
): void {
  context.beginPath();
  for (const feature of features) {
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        ring.forEach(([longitude, latitude], index) => {
          const point = map.latLngToLayerPoint([latitude, longitude]);
          const x = point.x - origin.x;
          const y = point.y - origin.y;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.closePath();
      }
    }
  }
}

function drawBoundaryOutlines(
  context: CanvasRenderingContext2D,
  map: L.Map,
  features: BoundaryFeature[],
  origin: L.Point,
  byCode: Record<string, DongRecord>,
  year: AnalysisYear,
): void {
  context.lineJoin = 'round';
  context.lineCap = 'round';
  for (const feature of features) {
    const scenarioClassification =
      byCode[feature.properties.adm_cd]?.history.vuln_2031;
    const baselineClassification = byCode[feature.properties.adm_cd]?.vuln;
    const scenarioWorsened =
      year === 2031 &&
      vulnerabilitySeverity(scenarioClassification) >
        vulnerabilitySeverity(baselineClassification);
    context.beginPath();
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        ring.forEach(([longitude, latitude], index) => {
          const point = map.latLngToLayerPoint([latitude, longitude]);
          const x = point.x - origin.x;
          const y = point.y - origin.y;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.closePath();
      }
    }
    context.strokeStyle = scenarioWorsened
      ? SCENARIO_BORDER_COLOR
      : BASELINE_BORDER_COLOR;
    context.lineWidth = scenarioWorsened ? 3.5 : 1;
    context.globalAlpha = 0.7;
    context.stroke();
  }
  context.globalAlpha = 1;
}

function vulnerabilitySeverity(value: string | null | undefined): number {
  if (value === '확정') return 2;
  if (value === '경계') return 1;
  return 0;
}

function interpolateColor(value: number): [number, number, number] {
  if (value <= COLOR_STOPS[0].value) return parseHexColor(COLOR_STOPS[0].color);
  for (let index = 1; index < COLOR_STOPS.length; index += 1) {
    const previous = COLOR_STOPS[index - 1];
    const next = COLOR_STOPS[index];
    if (value > next.value) continue;
    const ratio = (value - previous.value) / (next.value - previous.value);
    const start = parseHexColor(previous.color);
    const end = parseHexColor(next.color);
    return [
      Math.round(start[0] + (end[0] - start[0]) * ratio),
      Math.round(start[1] + (end[1] - start[1]) * ratio),
      Math.round(start[2] + (end[2] - start[2]) * ratio),
    ];
  }
  return parseHexColor(COLOR_STOPS[COLOR_STOPS.length - 1].color);
}

function parseHexColor(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}
