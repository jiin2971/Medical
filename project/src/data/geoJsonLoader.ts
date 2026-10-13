import type { GeoJSONCollection, GeoJSONFeature } from '@/types/dashboard';

const GEOJSON_URL =
  'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-submunicipalities-2018-geo.json';

const INCHEON_CODE_PREFIX = '23';

export async function fetchIncheonGeoJSON(): Promise<GeoJSONCollection> {
  try {
    const res = await fetch(GEOJSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: GeoJSONCollection = await res.json();
    const incheonFeatures = data.features.filter(
      (f) => f.properties.code.startsWith(INCHEON_CODE_PREFIX)
    );
    return { type: 'FeatureCollection', features: incheonFeatures };
  } catch (err) {
    console.error('Failed to fetch Incheon GeoJSON, using fallback:', err);
    return getFallbackGeoJSON();
  }
}

export function getFallbackGeoJSON(): GeoJSONCollection {
  const fallbackDongs: { code: string; name: string; nameEng: string }[] = [
    { code: '2301052', name: '연안동', nameEng: 'Yeonandong' },
    { code: '2301053', name: '신포동', nameEng: 'Sinpo-dong' },
    { code: '2301054', name: '신흥동', nameEng: 'Sinheung-dong' },
    { code: '2302051', name: '만석동', nameEng: 'Manseok-dong' },
    { code: '2304053', name: '연수1동', nameEng: 'Yeonsu 1-dong' },
    { code: '2304064', name: '송도1동', nameEng: 'Songdo1-dong' },
    { code: '2305051', name: '구월1동', nameEng: 'Guwol 1-dong' },
    { code: '2306051', name: '부평1동', nameEng: 'Bupyeong 1-dong' },
    { code: '2307051', name: '효성1동', nameEng: 'Hyoseong 1-dong' },
    { code: '2308051', name: '검암경서동', nameEng: 'Geomamgyeongseodong' },
  ];

  const features: GeoJSONFeature[] = fallbackDongs.map((d) => ({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: generateFallbackPolygon(d.code),
    },
    properties: {
      name: d.name,
      base_year: '2018',
      name_eng: d.nameEng,
      code: d.code,
    },
  }));

  return { type: 'FeatureCollection', features };
}

function generateFallbackPolygon(code: string): number[][][] {
  const seed = parseInt(code.slice(-4)) || 1;
  const baseLng = 126.7052 + (seed % 10) * 0.03 - 0.15;
  const baseLat = 37.4563 + (seed % 7) * 0.03 - 0.1;
  const size = 0.015;
  return [[
    [baseLng, baseLat],
    [baseLng + size, baseLat],
    [baseLng + size, baseLat + size],
    [baseLng, baseLat + size],
    [baseLng, baseLat],
  ]];
}

export function getFeatureCentroid(feature: GeoJSONFeature): [number, number] {
  const geom = feature.geometry;
  let allCoords: number[][] = [];

  if (geom.type === 'MultiPolygon') {
    const coords = geom.coordinates as number[][][][];
    let largest = coords[0][0];
    let maxLen = 0;
    for (const polygon of coords) {
      if (polygon[0].length > maxLen) {
        maxLen = polygon[0].length;
        largest = polygon[0];
      }
    }
    allCoords = largest;
  } else if (geom.type === 'Polygon') {
    const coords = geom.coordinates as number[][][];
    allCoords = coords[0];
  }

  if (allCoords.length === 0) return [37.4563, 126.7052];

  let latSum = 0;
  let lngSum = 0;
  for (const [lng, lat] of allCoords) {
    latSum += lat;
    lngSum += lng;
  }
  return [latSum / allCoords.length, lngSum / allCoords.length];
}
