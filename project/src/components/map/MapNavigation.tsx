import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { BoundaryCollection } from '@/types/dashboard';
import { useDashboardData } from '@/data/useDashboardData';
import { SearchBar } from '@/components/map/SearchBar';
interface MapNavigationProps {
  boundaries: BoundaryCollection;
  onSelectCode: (code: string) => void;
}
export function MapNavigation({
  boundaries,
  onSelectCode,
}: MapNavigationProps) {
  const map = useMap();
  const { records } = useDashboardData();
  const hasSkippedInitialFit = useRef(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [focusCode, setFocusCode] = useState<string | null>(null);
  const districts = [
    ...new Set(
      records
        .map((record) => record.sgg_nm)
        .filter((name): name is string => Boolean(name)),
    ),
  ].sort();
  useEffect(() => {
    if (!hasSkippedInitialFit.current) {
      hasSkippedInitialFit.current = true;
      return;
    }
    const layer = L.geoJSON(boundaries);
    if (focusCode) {
      const feature = boundaries.features.find(
        (candidate) => candidate.properties.adm_cd === focusCode,
      );
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        if (bounds.isValid())
          map.flyToBounds(bounds, {
            padding: [28, 28],
            maxZoom: 13,
            duration: 0.8,
          });
      }
      return;
    }
    const districtFeatures = selectedDistrict
      ? boundaries.features.filter((feature) =>
          records.some(
            (record) =>
              record.adm_cd === feature.properties.adm_cd &&
              record.sgg_nm === selectedDistrict,
          ),
        )
      : boundaries.features;
    const bounds =
      selectedDistrict && districtFeatures.length > 0
        ? L.featureGroup(
            districtFeatures.map((feature) => L.geoJSON(feature)),
          ).getBounds()
        : layer.getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [30, 30],
        maxZoom: selectedDistrict ? 11 : 9,
        duration: 0.8,
      });
    }
  }, [boundaries, focusCode, map, records, selectedDistrict]);
  const chooseArea = (code: string) => {
    setSelectedDistrict('');
    setFocusCode(code);
    onSelectCode(code);
  };
  const resetIncheonView = () => {
    setSelectedDistrict('');
    setFocusCode(null);
    const bounds = L.geoJSON(boundaries).getBounds();
    if (bounds.isValid())
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 9, duration: 0.8 });
  };
  return (
    <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-2">
      {' '}
      <SearchBar onSelect={chooseArea} />{' '}
      <div className="flex gap-2">
        {' '}
        <button
          onClick={resetIncheonView}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {' '}
          인천 전체{' '}
        </button>{' '}
        <select
          value={selectedDistrict}
          onChange={(event) => {
            setFocusCode(null);
            setSelectedDistrict(event.target.value);
          }}
          aria-label="구·군 선택"
          className="max-w-36 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 "
        >
          {' '}
          <option value="">구·군 선택</option>{' '}
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}{' '}
        </select>{' '}
      </div>{' '}
    </div>
  );
}
