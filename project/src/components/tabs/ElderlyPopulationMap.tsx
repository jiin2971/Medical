import { useEffect, useState, useRef, useCallback } from 'react';
import { GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import type { GeoJSON as LeafletGeoJSON } from 'leaflet';
import { IncheonMap } from '@/components/map/IncheonMap';
import { GradientLegend } from '@/components/map/GradientLegend';
import { TimeSlider } from '@/components/map/TimeSlider';
import { SearchBar } from '@/components/map/SearchBar';
import { DongDetailModal } from '@/components/DongDetailModal';
import { fetchIncheonGeoJSON, getFeatureCentroid } from '@/data/geoJsonLoader';
import { getMetricsMapForYear, getMetricsForYear } from '@/data/mockData';
import { YEAR_RANGE } from '@/types/dashboard';
import type { GeoJSONCollection, DongMetrics } from '@/types/dashboard';
import { populationColor } from '@/utils/colors';
import { Users, TrendingUp } from 'lucide-react';

export function ElderlyPopulationMap() {
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(YEAR_RANGE[0]);
  const [selectedDong, setSelectedDong] = useState<DongMetrics | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);

  useEffect(() => {
    fetchIncheonGeoJSON().then((data) => {
      setGeoData(data);
      setLoading(false);
    });
  }, []);

  const dongMetrics = getMetricsForYear(year);
  const metricsMap = getMetricsMapForYear(year);
  const maxAgingRate = Math.max(...dongMetrics.map((d) => d.agingRate));

  const styleFeature = useCallback(
    (feature: { properties: { code: string } }) => {
      const metrics = metricsMap[feature.properties.code];
      const rate = metrics?.agingRate ?? 0;
      const isHighlighted = highlightedCode === feature.properties.code;
      return {
        fillColor: populationColor(rate),
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
      `<div style="min-width: 170px;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; color: #f8fafc;">${metrics.name}</div>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; font-size: 11px; color: #cbd5e1;">
          <span>전체 인구</span><span style="font-weight: 600; color: #f1f5f9; text-align: right;">${metrics.totalPopulation.toLocaleString()}명</span>
          <span>고령인구 (65세+)</span><span style="font-weight: 600; color: #fca5a5; text-align: right;">${metrics.agingPopulation.toLocaleString()}명</span>
          <span>고령화율</span><span style="font-weight: 700; color: #ef4444; text-align: right;">${metrics.agingRate.toFixed(1)}%</span>
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
    setHighlightedCode(code);
    const m = metricsMap[code];
    if (m) setSelectedDong(m);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 min-h-[550px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">고령인구 데이터 로딩 중...</p>
            </div>
          </div>
        ) : (
          <IncheonMap>
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
                    {`${metrics.agingRate.toFixed(0)}%`}
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

        <div className="absolute bottom-3 right-3 z-[1000] w-48">
          <GradientLegend
            title="고령화율 (%)"
            minLabel="0%"
            maxLabel={`${maxAgingRate.toFixed(0)}%`}
            gradient="linear-gradient(90deg, #DBEAFE, #93C5FD, #60A5FA, #2563EB, #1E3A8A)"
          />
        </div>
      </div>

      <div className="lg:w-80 shrink-0 space-y-3">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
            <Users size={16} className="text-blue-400" />
            인구 요약 ({year}년)
          </h3>
          <div className="space-y-2">
            <StatRow label="행정동 수" value={String(dongMetrics.length)} />
            <StatRow
              label="전체 인구"
              value={`${dongMetrics.reduce((s, d) => s + d.totalPopulation, 0).toLocaleString()}명`}
            />
            <StatRow
              label="고령인구 (65세+)"
              value={`${dongMetrics.reduce((s, d) => s + d.agingPopulation, 0).toLocaleString()}명`}
            />
            <StatRow
              label="평균 고령화율"
              value={`${(dongMetrics.reduce((s, d) => s + d.agingRate, 0) / dongMetrics.length).toFixed(1)}%`}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-red-400" />
            고령화율 상위 지역
          </h3>
          <div className="space-y-1.5">
            {[...dongMetrics]
              .sort((a, b) => b.agingRate - a.agingRate)
              .slice(0, 8)
              .map((d, i) => (
                <div key={d.code} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate">{i + 1}. {d.name}</span>
                  <span className="font-bold text-red-400 ml-2">{d.agingRate.toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <DongDetailModal metrics={selectedDong} onClose={() => setSelectedDong(null)} />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
