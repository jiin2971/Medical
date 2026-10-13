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
import { facilityColor } from '@/utils/colors';
import { Building2, Stethoscope, Pill, Cross } from 'lucide-react';

type FacilityType = 'majorHospitals' | 'smallClinics' | 'pharmacies' | 'emergencyRoomCount';

const FACILITY_INFO: Record<FacilityType, { label: string; icon: typeof Building2; color: string }> = {
  majorHospitals: { label: '대형병원', icon: Building2, color: '#ef4444' },
  smallClinics: { label: '소형의원', icon: Stethoscope, color: '#0ea5e9' },
  pharmacies: { label: '약국', icon: Pill, color: '#22c55e' },
  emergencyRoomCount: { label: '응급실', icon: Cross, color: '#f97316' },
};

export function MedicalFacilitiesMap() {
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(YEAR_RANGE[0]);
  const [activeFacility, setActiveFacility] = useState<FacilityType>('majorHospitals');
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
  const maxCount = Math.max(...dongMetrics.map((d) => d[activeFacility]));

  const styleFeature = useCallback(
    (feature: { properties: { code: string } }) => {
      const metrics = metricsMap[feature.properties.code];
      const count = metrics?.[activeFacility] ?? 0;
      const isHighlighted = highlightedCode === feature.properties.code;
      return {
        fillColor: facilityColor(count, maxCount),
        weight: isHighlighted ? 4 : 0,
        opacity: isHighlighted ? 1 : 0,
        color: isHighlighted ? '#ffffff' : 'transparent',
        fillOpacity: 0.75,
      };
    },
    [metricsMap, maxCount, activeFacility, highlightedCode],
  );

  const onEachFeature = (
    feature: { properties: { code: string; name: string } },
    layer: LeafletGeoJSON,
  ) => {
    const metrics = metricsMap[feature.properties.code];
    if (!metrics) return;

    const totalFac = metrics.majorHospitals + metrics.smallClinics + metrics.pharmacies;

    layer.bindTooltip(
      `<div style="min-width: 190px;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; color: #f8fafc;">${metrics.name}</div>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 3px 12px; font-size: 11px; color: #cbd5e1;">
          <span>대형병원</span><span style="font-weight: 600; color: #fca5a5; text-align: right;">${metrics.majorHospitals}개</span>
          <span>소형의원</span><span style="font-weight: 600; color: #7dd3fc; text-align: right;">${metrics.smallClinics}개</span>
          <span>약국</span><span style="font-weight: 600; color: #86efac; text-align: right;">${metrics.pharmacies}개</span>
          <span>응급실</span><span style="font-weight: 600; color: #fdba74; text-align: right;">${metrics.emergencyRoomCount}개</span>
          <span style="border-top: 1px solid #475569; padding-top: 3px; margin-top: 2px;">의료시설 합계</span>
          <span style="font-weight: 700; color: #f1f5f9; text-align: right; border-top: 1px solid #475569; padding-top: 3px; margin-top: 2px;">${totalFac}개</span>
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
              <div className="w-10 h-10 border-[3px] border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">의료시설 데이터 로딩 중...</p>
            </div>
          </div>
        ) : (
          <IncheonMap>
            {geoData && (
              <GeoJSON
                key={`${activeFacility}-${year}`}
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
                if (!metrics || metrics[activeFacility] === 0) return null;
                const centroid = getFeatureCentroid(feature);
                return (
                  <LeafletTooltip
                    key={`label-${feature.properties.code}`}
                    position={centroid}
                    permanent
                    className="dong-label"
                  >
                    {String(metrics[activeFacility])}
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
            title={`${FACILITY_INFO[activeFacility].label} 수`}
            minLabel="0개"
            maxLabel={`${maxCount}개`}
            gradient="linear-gradient(90deg, #E0F2FE, #7DD3FC, #0EA5E9, #0284C7, #0C4A6E)"
          />
        </div>
      </div>

      <div className="lg:w-80 shrink-0 space-y-3">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">시설 유형 선택</h3>
          <div className="space-y-2">
            {(Object.keys(FACILITY_INFO) as FacilityType[]).map((key) => {
              const info = FACILITY_INFO[key];
              const Icon = info.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFacility(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    activeFacility === key
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={18} style={{ color: info.color }} />
                  <span className="text-sm text-slate-300 flex-1 text-left">{info.label}</span>
                  <span className="text-xs font-bold text-white">
                    {dongMetrics.reduce((s, d) => s + d[key], 0)}개
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">시설 수 상위 지역</h3>
          <div className="space-y-1.5">
            {[...dongMetrics]
              .sort((a, b) => b[activeFacility] - a[activeFacility])
              .slice(0, 8)
              .map((d, i) => (
                <div key={d.code} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate">{i + 1}. {d.name}</span>
                  <span className="font-bold text-sky-400 ml-2">{d[activeFacility]}개</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <DongDetailModal metrics={selectedDong} onClose={() => setSelectedDong(null)} />
    </div>
  );
}
