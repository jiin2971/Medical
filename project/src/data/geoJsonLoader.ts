import pointOnFeature from '@turf/point-on-feature';
import type { BoundaryCollection, BoundaryFeature } from '@/types/dashboard';
const EXPECTED_BOUNDARY_COUNT = 156;
const INCHEON_WGS84_BOUNDS = {
  minLongitude: 124,
  maxLongitude: 127.5,
  minLatitude: 36.8,
  maxLatitude: 38,
} as const;
export async function fetchIncheonGeoJSON(): Promise<BoundaryCollection> {
  const response = await fetch('/data/dong_boundary.geojson');
  if (!response.ok)
    throw new Error(`/data/dong_boundary.geojson: HTTP ${response.status}`);
  const data: unknown = await response.json();
  assertIncheonBoundaryCollection(data);
  return data;
}
export function getFeatureCentroid(feature: BoundaryFeature): [number, number] {
  const point = pointOnFeature(feature);
  const [longitude, latitude] = point.geometry.coordinates;
  return [latitude, longitude];
}
function assertIncheonBoundaryCollection(
  data: unknown,
): asserts data is BoundaryCollection {
  if (!data || typeof data !== 'object') {
    throw new Error(
      '/data/dong_boundary.geojson: 경계 GeoJSON 구조가 올바르지 않습니다.',
    );
  }
  const collection = data as { type?: unknown; features?: unknown };
  if (
    collection.type !== 'FeatureCollection' ||
    !Array.isArray(collection.features)
  ) {
    throw new Error(
      '/data/dong_boundary.geojson: 경계 GeoJSON 구조가 올바르지 않습니다.',
    );
  }
  if (collection.features.length !== EXPECTED_BOUNDARY_COUNT) {
    throw new Error(
      `/data/dong_boundary.geojson: 인천 행정동 경계는 ${EXPECTED_BOUNDARY_COUNT}개여야 합니다 (현재 ${collection.features.length}개).`,
    );
  }
  for (const feature of collection.features) {
    if (!feature || typeof feature !== 'object') {
      throw new Error(
        '/data/dong_boundary.geojson: 경계 GeoJSON 구조가 올바르지 않습니다.',
      );
    }
    const candidate = feature as {
      type?: unknown;
      geometry?: { type?: unknown; coordinates?: unknown };
      properties?: { adm_cd?: unknown; adm_nm?: unknown };
    };
    if (
      candidate.type !== 'Feature' ||
      (candidate.geometry?.type !== 'Polygon' &&
        candidate.geometry?.type !== 'MultiPolygon') ||
      typeof candidate.properties?.adm_cd !== 'string' ||
      typeof candidate.properties.adm_nm !== 'string'
    ) {
      throw new Error(
        '/data/dong_boundary.geojson: 경계 GeoJSON 구조가 올바르지 않습니다.',
      );
    }
    if (!isIncheonPositionTree(candidate.geometry.coordinates)) {
      throw new Error(
        `/data/dong_boundary.geojson: 행정동 코드 ${candidate.properties.adm_cd}의 좌표가 인천 WGS84 범위를 벗어나거나 올바르지 않습니다. EPSG:4326 경도·위도 좌표를 사용해야 합니다 (경도 124.0°–127.5°, 위도 36.8°–38.0°).`,
      );
    }
  }
}
function isIncheonPositionTree(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  if (value.every((coordinate) => typeof coordinate === 'number')) {
    const [longitude, latitude] = value as number[];
    return (
      value.length >= 2 &&
      value.every(Number.isFinite) &&
      longitude >= INCHEON_WGS84_BOUNDS.minLongitude &&
      longitude <= INCHEON_WGS84_BOUNDS.maxLongitude &&
      latitude >= INCHEON_WGS84_BOUNDS.minLatitude &&
      latitude <= INCHEON_WGS84_BOUNDS.maxLatitude
    );
  }
  return value.every(isIncheonPositionTree);
}
