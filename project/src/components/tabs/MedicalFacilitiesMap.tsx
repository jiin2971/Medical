import { useMemo, useState } from 'react';
import { CircleMarker, GeoJSON, Popup } from 'react-leaflet';
import { Building2, Search, Stethoscope } from 'lucide-react';
import { IncheonMap } from '@/components/map/IncheonMap';
import { GradientLegend } from '@/components/map/GradientLegend';
import { MapNavigation } from '@/components/map/MapNavigation';
import { DongDetailModal } from '@/components/DongDetailModal';
import { useDashboardData } from '@/data/useDashboardData';
import type { DongRecord } from '@/types/dashboard';
import { ACC_INDEX_HELP } from '@/types/dashboard';
import { facilitiesCountColor, metricColor } from '@/utils/colors';
import { formatNumber } from '@/utils/format';
type FacilityMetric =
  'doc_S_in_dong' | 'doc_per_1k_eld' | 'acc_600' | 'facilityCount';
const METRICS: Array<{ value: FacilityMetric; label: string; help: string }> = [
  {
    value: 'doc_S_in_dong',
    label: '의사 공급량 S 합계',
    help: '적격 만성질환 의사 공급량 S의 합계입니다. 시설 수와 다릅니다.',
  },
  {
    value: 'doc_per_1k_eld',
    label: '고령인구 1,000명당 의사 공급',
    help: 'doc_per_1k_eld 원자료 값입니다.',
  },
  {
    value: 'acc_600',
    label: '600m 2SFCA 접근성 지수',
    help: '2SFCA 접근성 지수(원자료 단위)입니다. 값이 클수록 접근성이 더 좋습니다.',
  },
  {
    value: 'facilityCount',
    label: '분석 적격 의료기관 점 수',
    help: 'GeoJSON의 행정동 연결 시설 Point 개수입니다. S 공급량과 다릅니다.',
  },
];
export function MedicalFacilitiesMap() {
  const { records, boundaries, facilities, byCode } = useDashboardData();
  const [metric, setMetric] = useState<FacilityMetric>('doc_S_in_dong');
  const [selectedDong, setSelectedDong] = useState<DongRecord | null>(null);
  const [facilityQuery, setFacilityQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    () => new Set(['의원', '병원', '종합병원']),
  );
  const facilityTypes = [
    ...new Set(facilities.features.map((feature) => feature.properties.type)),
  ].sort();
  const query = facilityQuery.trim().toLocaleLowerCase('ko-KR');
  const visibleFacilities = facilities.features.filter((feature) => {
    const matchesType = selectedTypes.has(feature.properties.type);
    const matchesName =
      !query ||
      feature.properties.name.toLocaleLowerCase('ko-KR').includes(query);
    return matchesType && matchesName;
  });
  const facilityCountByCode = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const feature of visibleFacilities) {
      const { adm_cd: code, admin_join_ok: joined } = feature.properties;
      if (joined !== 1 || !code) continue;
      counts[code] = (counts[code] ?? 0) + 1;
    }
    return counts;
  }, [visibleFacilities]);
  const metricValues = records
    .map((record) =>
      metric === 'facilityCount'
        ? (facilityCountByCode[record.adm_cd] ?? 0)
        : record[metric],
    )
    .filter((value): value is number => value !== null);
  const minimum = metric === 'facilityCount' ? 0 : Math.min(...metricValues);
  const maximum = Math.max(...metricValues);
  const totalSupply = visibleFacilities.reduce(
    (sum, feature) => sum + (feature.properties.S ?? 0),
    0,
  );
  const unmatchedCount = visibleFacilities.filter(
    (feature) => feature.properties.admin_join_ok !== 1,
  ).length;
  const selectedMetric =
    METRICS.find((item) => item.value === metric) ?? METRICS[0];
  const selectArea = (code: string) => setSelectedDong(byCode[code] ?? null);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,0.8fr)]">
      {' '}
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        {' '}
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          {' '}
          <div>
            {' '}
            <h2 className="text-base font-bold text-white">
              2026 기준 분석 적격 의료기관과 접근성
            </h2>{' '}
            <p className="mt-1 text-xs text-slate-400">
              시설 위치 697곳 · 모든 시설은 2026 분석 기준입니다.
            </p>{' '}
          </div>{' '}
          <select
            value={metric}
            onChange={(event) =>
              setMetric(event.target.value as FacilityMetric)
            }
            aria-label="지도 지표 선택"
            className="max-w-64 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200"
          >
            {' '}
            {METRICS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}{' '}
          </select>{' '}
        </div>{' '}
        <div className="relative h-[680px] overflow-hidden rounded-xl border border-slate-200">
          {' '}
          <IncheonMap>
            {' '}
            <GeoJSON
              data={boundaries}
              interactive
              style={(feature) => {
                const code = feature?.properties?.adm_cd;
                const record =
                  typeof code === 'string' ? byCode[code] : undefined;
                const value =
                  metric === 'facilityCount'
                    ? typeof code === 'string'
                      ? (facilityCountByCode[code] ?? 0)
                      : 0
                    : (record?.[metric] ?? null);
                const fillColor =
                  metric === 'facilityCount'
                    ? facilitiesCountColor(value ?? 0, maximum)
                    : metricColor(value, minimum, maximum);
                return {
                  fillColor,
                  fillOpacity: 0.65,
                  color: '#0f172a',
                  weight: 0.55,
                };
              }}
              onEachFeature={(feature, layer) => {
                const code = feature.properties?.adm_cd;
                const record =
                  typeof code === 'string' ? byCode[code] : undefined;
                if (!record) return;
                layer.on('click', () => setSelectedDong(record));
              }}
            />{' '}
            {visibleFacilities.map((feature) => {
              const [longitude, latitude] = feature.geometry.coordinates;
              const properties = feature.properties;
              const isJoined = properties.admin_join_ok === 1;
              return (
                <CircleMarker
                  key={properties.fac_id}
                  center={[latitude, longitude]}
                  radius={isJoined ? 3 : 6}
                  pathOptions={{
                    color: isJoined ? '#e0f2fe' : '#fbbf24',
                    fillColor: isJoined ? '#0ea5e9' : '#f59e0b',
                    fillOpacity: 0.9,
                    weight: isJoined ? 1 : 2,
                  }}
                >
                  {' '}
                  <Popup>
                    {' '}
                    <div className="min-w-48 space-y-1">
                      {' '}
                      <p className="font-bold">{properties.name}</p>{' '}
                      <p>유형: {properties.type}</p>{' '}
                      <p>의사 공급 S: {formatNumber(properties.S, 2)}</p>{' '}
                      <p>주소: {properties.address ?? '자료 없음'}</p>{' '}
                      <p>
                        행정동 연결:{' '}
                        {isJoined
                          ? `${properties.adm_nm ?? '자료 없음'} (${properties.adm_cd ?? '코드 없음'})`
                          : '행정동 미연결'}
                      </p>{' '}
                    </div>{' '}
                  </Popup>{' '}
                </CircleMarker>
              );
            })}{' '}
            <MapNavigation
              boundaries={boundaries}
              onSelectCode={selectArea}
            />{' '}
          </IncheonMap>{' '}
          <div className="absolute bottom-3 right-3 z-[900] w-56">
            {' '}
            <GradientLegend
              title={selectedMetric.label}
              minLabel={formatNumber(minimum, metric === 'acc_600' ? 4 : 0)}
              maxLabel={formatNumber(maximum, metric === 'acc_600' ? 4 : 0)}
              gradient="linear-gradient(90deg, #E0F2FE, #7DD3FC, #0EA5E9, #0284C7, #0C4A6E)"
            />{' '}
          </div>{' '}
          <div className="absolute bottom-3 left-3 z-[900] rounded-lg border border-slate-700 bg-white px-3 py-2 text-[10px] text-slate-300">
            {' '}
            파란 점: 행정동 연결 · 노란 점: 행정동 미연결{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
      <aside className="space-y-4">
        {' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">
            시설 종류·이름 검색
          </h3>{' '}
          <div className="mt-3 space-y-2">
            {' '}
            {facilityTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-300"
              >
                {' '}
                <input
                  type="checkbox"
                  checked={selectedTypes.has(type)}
                  onChange={(event) => {
                    setSelectedTypes((current) => {
                      const next = new Set(current);
                      if (event.target.checked) next.add(type);
                      else next.delete(type);
                      return next;
                    });
                  }}
                  className="accent-sky-500"
                />{' '}
                <span className="flex-1">{type}</span>{' '}
                <span className="text-slate-500">
                  {
                    facilities.features.filter(
                      (feature) => feature.properties.type === type,
                    ).length
                  }
                  곳
                </span>{' '}
              </label>
            ))}{' '}
          </div>{' '}
          <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-50 px-3 py-2">
            {' '}
            <Search size={15} className="text-slate-500" />{' '}
            <input
              value={facilityQuery}
              onChange={(event) => setFacilityQuery(event.target.value)}
              placeholder="의료기관 이름 검색"
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
            />{' '}
          </label>{' '}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {' '}
            <StatCard
              icon={<Building2 size={15} />}
              label="현재 표시 점 수"
              value={`${visibleFacilities.length}곳`}
            />{' '}
            <StatCard
              icon={<Stethoscope size={15} />}
              label="표시된 의사 공급 S"
              value={formatNumber(totalSupply, 2)}
            />{' '}
          </div>{' '}
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            {' '}
            697곳은 이번 분석에 적격으로 포함된 의료기관이며 인천의 모든
            의료기관 목록은 아닙니다. 시설 점 수와 의사 공급 S 합계를
            구분합니다.{' '}
          </p>{' '}
          {unmatchedCount > 0 && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-200">
              {' '}
              현재 필터 결과에서 행정동 미연결 {unmatchedCount}곳을 원래 좌표에
              표시합니다.{' '}
            </p>
          )}{' '}
        </section>{' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">
            행정동 지표 설명
          </h3>{' '}
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            {selectedMetric.help}
          </p>{' '}
          {metric === 'acc_600' && (
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {ACC_INDEX_HELP}
            </p>
          )}{' '}
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] text-slate-400">
            {' '}
            지도에 표시된 시설 위치는 2026 기준입니다. 이를 과거·미래의
            관측값으로 해석하지 않습니다.{' '}
          </p>{' '}
        </section>{' '}
      </aside>{' '}
      <DongDetailModal
        metrics={selectedDong}
        onClose={() => setSelectedDong(null)}
      />{' '}
    </div>
  );
}
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-50 p-3">
      {' '}
      <div className="flex items-center gap-1.5 text-sky-400">
        {icon}
        <span className="text-[10px] text-slate-400">{label}</span>
      </div>{' '}
      <p className="mt-1 text-sm font-bold text-white">{value}</p>{' '}
    </div>
  );
}
