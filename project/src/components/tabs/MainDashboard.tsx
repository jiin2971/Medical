import { useEffect, useState, useRef, useCallback } from 'react';
import { GeoJSON, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import type { GeoJSON as LeafletGeoJSON } from 'leaflet';
import L from 'leaflet';
import { IncheonMap } from '@/components/map/IncheonMap';
import { RiskGradeLegend } from '@/components/map/RiskGradeLegend';
import { SearchBar } from '@/components/map/SearchBar';
import { TimeSlider } from '@/components/map/TimeSlider';
import { DongDetailModal } from '@/components/DongDetailModal';
import { PersonaCarousel } from '@/components/PersonaCarousel';
import { fetchIncheonGeoJSON, getFeatureCentroid } from '@/data/geoJsonLoader';
import { getMetricsMapForYear } from '@/data/mockData';
import { RISK_GRADE_INFO, YEAR_RANGE } from '@/types/dashboard';
import type { GeoJSONCollection, DongMetrics } from '@/types/dashboard';
import { riskGradeColor } from '@/utils/colors';

function MapFocus({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 13, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export function MainDashboard() {
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDong, setSelectedDong] = useState<DongMetrics | null>(null);
  const [year, setYear] = useState<number>(YEAR_RANGE[0]);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);

  useEffect(() => {
    fetchIncheonGeoJSON().then((data) => {
      setGeoData(data);
      setLoading(false);
    });
  }, []);

  const metricsMap = getMetricsMapForYear(year);

  const styleFeature = useCallback(
    (feature: { properties: { code: string } }) => {
      const metrics = metricsMap[feature.properties.code];
      const grade = metrics?.riskGrade ?? 'safe';
      const isHighlighted = highlightedCode === feature.properties.code;
      return {
        fillColor: riskGradeColor(grade, 0.75),
        weight: isHighlighted ? 4 : 0,
        opacity: isHighlighted ? 1 : 0,
        color: isHighlighted ? '#ffffff' : 'transparent',
        fillOpacity: 0.75,
      };
    },
    [metricsMap, highlightedCode],
  );

  const onEachFeature = (
    feature: { properties: { code: string; name: string } },
    layer: LeafletGeoJSON,
  ) => {
    const metrics = metricsMap[feature.properties.code];
    if (!metrics) return;

    layer.bindTooltip(
      `<div style="min-width: 140px;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #f8fafc;">${metrics.name}</div>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; font-size: 11px; color: #cbd5e1;">
          <span>위험등급</span><span style="font-weight: 700; color: ${RISK_GRADE_INFO[metrics.riskGrade].color}; text-align: right;">${RISK_GRADE_INFO[metrics.riskGrade].label}</span>
          <span>취약성 점수</span><span style="font-weight: 600; color: #f1f5f9; text-align: right;">${metrics.vulnerabilityScore}</span>
          <span>고령화율</span><span style="font-weight: 600; color: #fca5a5; text-align: right;">${metrics.agingRate.toFixed(1)}%</span>
        </div>
      </div>`,
      { sticky: true, className: 'dong-tooltip', direction: 'top' },
    );

    layer.on({
      click: () => setSelectedDong(metrics),
      mouseover: (e: { target: LeafletGeoJSON }) => {
        e.target.setStyle({ weight: 3, opacity: 1, color: '#ffffff' });
      },
      mouseout: (e: { target: LeafletGeoJSON }) => {
        e.target.setStyle(styleFeature(feature));
      },
    });
  };

  const handleSearch = (code: string) => {
    const feature = geoData?.features.find((f) => f.properties.code === code);
    if (feature) {
      const centroid = getFeatureCentroid(feature);
      setHighlightedCode(code);
      setFocusTarget(centroid);
      const m = metricsMap[code];
      if (m) setSelectedDong(m);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 min-h-[550px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-10 h-10 border-[3px] border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">인천 행정동 경계 데이터 로딩 중...</p>
            </div>
          </div>
        ) : (
          <IncheonMap>
            <MapFocus target={focusTarget} />
            {geoData && (
              <GeoJSON
                key={year}
                ref={(ref) => {
                  geoJsonRef.current = ref;
                }}
                data={geoData}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}
            {geoData &&
              geoData.features.map((feature) => {
                const metrics = metricsMap[feature.properties.code];
                if (!metrics) return null;
                const centroid = getFeatureCentroid(feature);
                return (
                  <LeafletTooltip
                    key={`label-${feature.properties.code}`}
                    position={centroid}
                    permanent
                    className="dong-label"
                  >
                    {metrics.name}
                  </LeafletTooltip>
                );
              })}
          </IncheonMap>
        )}

        <div className="absolute top-3 left-3 z-[1000]">
          <SearchBar onSelect={handleSearch} />
        </div>

        <div className="absolute bottom-3 left-3 z-[1000] w-56">
          <TimeSlider year={year} onChange={setYear} />
        </div>

        <div className="absolute top-3 right-3 z-[1000]">
          <RiskGradeLegend />
        </div>
      </div>

      <div className="lg:w-[400px] shrink-0 min-h-[400px]">
        <PersonaCarousel />
      </div>

      <DongDetailModal
        metrics={selectedDong}
        onClose={() => setSelectedDong(null)}
      />
    </div>
  );
}
