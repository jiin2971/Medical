import { useMemo, useState } from 'react';
import { CircleMarker, GeoJSON } from 'react-leaflet';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IncheonMap } from '@/components/map/IncheonMap';
import { GradientLegend } from '@/components/map/GradientLegend';
import { MapNavigation } from '@/components/map/MapNavigation';
import { TimeSlider } from '@/components/map/TimeSlider';
import { DongDetailModal } from '@/components/DongDetailModal';
import { useDashboardData } from '@/data/useDashboardData';
import type { AnalysisYear, DongRecord } from '@/types/dashboard';
import { isVulnerable } from '@/types/dashboard';
import { getFeatureCentroid } from '@/data/geoJsonLoader';
import { metricColor, populationColor } from '@/utils/colors';
import { formatNumber, formatPercent, median } from '@/utils/format';
type PopulationView = 'elderly' | 'share' | 'change';
const VERIFIED_NEW_AREA_NAMES = new Set([
  '송도4동',
  '송도5동',
  '서창2동',
  '청라3동',
  '검단동',
  '불로대곡동',
  '당하동',
  '마전동',
  '원당동',
  '아라동',
]);
export function ElderlyPopulationMap() {
  const { records, boundaries, byCode } = useDashboardData();
  const [year, setYear] = useState<AnalysisYear>(2026);
  const [view, setView] = useState<PopulationView>('share');
  const [selectedDong, setSelectedDong] = useState<DongRecord | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const districts = [
    ...new Set(
      records
        .map((record) => record.sgg_nm)
        .filter((name): name is string => Boolean(name)),
    ),
  ].sort();
  const activeDistrict = districts.includes(selectedDistrict)
    ? selectedDistrict
    : (districts[0] ?? '');
  const changeYear = (nextYear: AnalysisYear) => {
    setYear(nextYear);
    if (nextYear === 2031 && view !== 'elderly') setView('elderly');
  };
  const rateValues = records
    .flatMap((record) => [
      record.history.eld_ratio_2016,
      record.history.eld_ratio_2021,
      record.eld_ratio,
    ])
    .filter((value): value is number => value !== null);
  const shareMinimum = Math.min(...rateValues);
  const shareMaximum = Math.max(...rateValues);
  const mapValues = records
    .map((record) => getPopulationValue(record, year, view))
    .filter((value): value is number => value !== null);
  const mapMinimum =
    view === 'share'
      ? shareMinimum
      : view === 'change'
        ? Math.min(...mapValues)
        : 0;
  const mapMaximum =
    view === 'share'
      ? shareMaximum
      : view === 'change'
        ? Math.max(...mapValues)
        : Math.max(...mapValues);
  const verifiedNewAreas = records.filter((record) => {
    const historical2016Missing =
      record.history.eld_2016 === null &&
      record.history.pop_2016 === null &&
      record.history.eld_ratio_2016 === null;
    return VERIFIED_NEW_AREA_NAMES.has(record.adm_nm) && historical2016Missing;
  });
  const vulnerableChanges = useMemo(
    () => records.filter((record) => isVulnerable(record.vuln)),
    [records],
  );
  const nonVulnerableChanges = useMemo(
    () => records.filter((record) => record.vuln === '비취약'),
    [records],
  );
  const vulnerableShareChange = median(
    vulnerableChanges.flatMap((record) =>
      record.history.d_ratio_16_26 === null
        ? []
        : [record.history.d_ratio_16_26],
    ),
  );
  const stableShareChange = median(
    nonVulnerableChanges.flatMap((record) =>
      record.history.d_ratio_16_26 === null
        ? []
        : [record.history.d_ratio_16_26],
    ),
  );
  const vulnerableElderlyGrowth = median(
    vulnerableChanges.flatMap((record) =>
      record.history.eld_gr_16_26 === null ? [] : [record.history.eld_gr_16_26],
    ),
  );
  const stableElderlyGrowth = median(
    nonVulnerableChanges.flatMap((record) =>
      record.history.eld_gr_16_26 === null ? [] : [record.history.eld_gr_16_26],
    ),
  );
  const agingFastVulnerable = records.filter(
    (record) => record.history.aging_fast === 1 && isVulnerable(record.vuln),
  );
  const districtTrend = getDistrictTrend(records, activeDistrict);
  const legend =
    view === 'share'
      ? {
          title: '고령화율 · 공통 척도',
          min: shareMinimum,
          max: shareMaximum,
          gradient:
            'linear-gradient(90deg, #DBEAFE, #93C5FD, #60A5FA, #2563EB, #1E3A8A)',
          suffix: '%',
        }
      : view === 'change'
        ? {
            title: '2016–2026 고령화율 변화',
            min: mapMinimum,
            max: mapMaximum,
            gradient:
              'linear-gradient(90deg, #DBEAFE, #60A5FA, #F59E0B, #EF4444)',
            suffix: '%p',
          }
        : {
            title:
              year === 2031 ? '2031 고령인구 시나리오' : `${year}년 고령인구`,
            min: 0,
            max: mapMaximum,
            gradient:
              'linear-gradient(90deg, #DBEAFE, #93C5FD, #60A5FA, #2563EB, #1E3A8A)',
            suffix: '명',
          };
  const selectArea = (code: string) => setSelectedDong(byCode[code] ?? null);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
      {' '}
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        {' '}
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          {' '}
          <div>
            {' '}
            <h2 className="text-base font-bold text-white">
              고령인구·고령화율 변화
            </h2>{' '}
            <p className="mt-1 text-xs text-slate-400">
              과거·현재 인구와 2031 공급 유지 시나리오를 구분해 표시합니다.
            </p>{' '}
          </div>{' '}
          <div className="flex flex-wrap gap-2">
            {' '}
            <select
              value={view}
              onChange={(event) =>
                setView(event.target.value as PopulationView)
              }
              aria-label="지도 지표 선택"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200"
            >
              {' '}
              <option value="elderly">고령인구</option>{' '}
              <option value="share" disabled={year === 2031}>
                고령화율
              </option>{' '}
              <option value="change" disabled={year === 2031}>
                2016–2026 고령화율 변화(%p)
              </option>{' '}
            </select>{' '}
            {view !== 'change' && (
              <div className="w-64">
                {' '}
                <TimeSlider year={year} onChange={changeYear} />{' '}
              </div>
            )}{' '}
          </div>{' '}
        </div>{' '}
        {year === 2031 && view === 'elderly' && (
          <p className="mb-3 rounded-lg border border-sky-200 bg-sky-50 p-2 text-[11px] text-sky-200">
            {' '}
            2031년 고령인구 시나리오입니다. 2031 총인구가 없어 고령화율은
            표시하지 않습니다.{' '}
          </p>
        )}{' '}
        <div className="relative h-[650px] overflow-hidden rounded-xl border border-slate-200">
          {' '}
          <IncheonMap labelYear={year}>
            {' '}
            <GeoJSON
              data={boundaries}
              interactive
              style={(feature) => {
                const code = feature?.properties?.adm_cd;
                const record =
                  typeof code === 'string' ? byCode[code] : undefined;
                const value = record
                  ? getPopulationValue(record, year, view)
                  : null;
                const fastVulnerable =
                  year !== 2031 &&
                  record?.history.aging_fast === 1 &&
                  isVulnerable(record.vuln);
                return {
                  fillColor:
                    view === 'share'
                      ? populationColor(value, shareMinimum, shareMaximum)
                      : view === 'change'
                        ? metricColor(value, mapMinimum, mapMaximum)
                        : populationColor(value, 0, mapMaximum),
                  fillOpacity: value === null ? 0.9 : 0.78,
                  color:
                    view === 'change' && record && isVulnerable(record.vuln)
                      ? '#FDE047'
                      : fastVulnerable
                        ? '#FDE047'
                        : '#0f172a',
                  weight:
                    view === 'change' && record && isVulnerable(record.vuln)
                      ? 2.2
                      : fastVulnerable
                        ? 2.4
                        : 0.55,
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
            <MapNavigation boundaries={boundaries} onSelectCode={selectArea} />{' '}
            {view === 'change' &&
              agingFastVulnerable.map((record) => {
                const feature = boundaries.features.find(
                  (candidate) => candidate.properties.adm_cd === record.adm_cd,
                );
                if (!feature) return null;
                const position = getFeatureCentroid(feature);
                return (
                  <CircleMarker
                    key={`fast-${record.adm_cd}`}
                    center={position}
                    radius={3}
                    pathOptions={{
                      color: '#FDE047',
                      fillColor: '#FDE047',
                      fillOpacity: 0.9,
                    }}
                    eventHandlers={{ click: () => setSelectedDong(record) }}
                  >
                    {' '}
                  </CircleMarker>
                );
              })}{' '}
          </IncheonMap>{' '}
          <div className="absolute bottom-3 right-3 z-[900] w-52">
            {' '}
            <GradientLegend
              title={legend.title}
              minLabel={`${formatNumber(legend.min, view === 'share' ? 1 : 0)}${legend.suffix}`}
              maxLabel={`${formatNumber(legend.max, view === 'share' ? 1 : 0)}${legend.suffix}`}
              gradient={legend.gradient}
            />{' '}
          </div>{' '}
          {view === 'change' && (
            <div className="absolute bottom-3 left-3 z-[900] rounded-lg border border-yellow-300 bg-white px-3 py-2 text-[11px] text-yellow-100">
              {' '}
              노란 테두리: 2026 취약 동{' '}
            </div>
          )}{' '}
        </div>{' '}
      </section>{' '}
      <aside className="space-y-4">
        {' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">
            취약 분류별 과거 변화 중앙값
          </h3>{' '}
          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
            {' '}
            유효한 2016–2026 변화 값만 사용했습니다. 빈 과거 비교 값은 제외하며,
            비취약은 안전을 보장하지 않습니다.{' '}
          </p>{' '}
          <div className="mt-3 space-y-2">
            {' '}
            <ComparisonCard
              label="확정·경계"
              shareChange={vulnerableShareChange}
              shareCount={
                vulnerableChanges.filter(
                  (record) => record.history.d_ratio_16_26 !== null,
                ).length
              }
              elderlyGrowth={vulnerableElderlyGrowth}
              growthCount={
                vulnerableChanges.filter(
                  (record) => record.history.eld_gr_16_26 !== null,
                ).length
              }
            />{' '}
            <ComparisonCard
              label="비취약"
              shareChange={stableShareChange}
              shareCount={
                nonVulnerableChanges.filter(
                  (record) => record.history.d_ratio_16_26 !== null,
                ).length
              }
              elderlyGrowth={stableElderlyGrowth}
              growthCount={
                nonVulnerableChanges.filter(
                  (record) => record.history.eld_gr_16_26 !== null,
                ).length
              }
            />{' '}
          </div>{' '}
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            {' '}
            고령화율 상승은 고령인구 증가와 비고령 인구 감소가 함께 기여했을
            가능성이 있습니다. 연령별 이동 자료가 없어 청년층 유출로 단정하지
            않습니다.{' '}
          </p>{' '}
        </section>{' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">
            고령화 빠른 취약 동
          </h3>{' '}
          <p className="mt-1 text-[10px] text-slate-500">
            원자료 aging_fast=1 및 2026 분류 확정·경계 기준
          </p>{' '}
          <div className="mt-3 flex max-h-48 flex-wrap gap-1.5 overflow-auto scrollbar-thin">
            {' '}
            {agingFastVulnerable.map((record) => (
              <button
                key={record.adm_cd}
                onClick={() => setSelectedDong(record)}
                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-200 hover:bg-amber-100"
              >
                {' '}
                {record.adm_nm}{' '}
              </button>
            ))}{' '}
          </div>{' '}
        </section>{' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {' '}
            <div>
              {' '}
              <h3 className="text-sm font-bold text-white">
                구·군 고령화율 변화
              </h3>{' '}
              <p className="mt-1 text-[10px] text-slate-500">
                고령인구 합계 ÷ 총인구 합계 · 과거 값이 있는 동 기준
              </p>{' '}
            </div>{' '}
            <select
              value={activeDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              aria-label="구·군 추이 선택"
              className="max-w-36 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200"
            >
              {' '}
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}{' '}
            </select>{' '}
          </div>{' '}
          <div className="mt-3 h-52">
            {' '}
            <ResponsiveContainer>
              {' '}
              <LineChart
                data={districtTrend}
                margin={{ top: 8, right: 14, bottom: 4, left: -14 }}
              >
                {' '}
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />{' '}
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  stroke="#475569"
                />{' '}
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  stroke="#475569"
                  unit="%"
                />{' '}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as DistrictTrendPoint;
                    return (
                      <div className="rounded-lg border border-slate-600 bg-slate-800 p-2 text-xs">
                        {' '}
                        <p className="font-semibold text-white">
                          {activeDistrict} · {label}년
                        </p>{' '}
                        <p className="mt-1 text-sky-300">
                          고령화율: {formatPercent(row.share)}
                        </p>{' '}
                        <p className="text-slate-400">
                          유효 행정동: {row.validCount}/{row.areaCount}
                        </p>{' '}
                      </div>
                    );
                  }}
                />{' '}
                <Line
                  type="monotone"
                  dataKey="share"
                  name="고령화율"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  connectNulls={false}
                  dot={{ r: 3 }}
                />{' '}
              </LineChart>{' '}
            </ResponsiveContainer>{' '}
          </div>{' '}
          <div className="grid grid-cols-3 gap-1 text-center text-[9px] text-slate-500">
            {' '}
            {districtTrend.map((point) => (
              <span key={point.year}>
                {point.year}: {point.validCount}/{point.areaCount} 동
              </span>
            ))}{' '}
          </div>{' '}
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            {' '}
            2031 총인구가 없어 미래 고령화율은 산출하지 않았습니다. 구·군 지표는
            유효한 행정동 행만 합산하며, 결측 인구를 0으로 대체하지
            않습니다.{' '}
          </p>{' '}
        </section>{' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">
            2016 과거 비교자료 없는 신설·분할 동
          </h3>{' '}
          <p className="mt-1 text-[10px] text-slate-500">
            제공된 명단 10곳은 2016 값이 비어 있습니다. 2021 값은 제공되어 해당
            연도 지도에는 원자료를 표시합니다.
          </p>{' '}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {' '}
            {verifiedNewAreas.map((record) => (
              <button
                key={record.adm_cd}
                onClick={() => setSelectedDong(record)}
                className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700"
              >
                {' '}
                {record.adm_nm} · 신설 동·과거 비교자료 없음{' '}
              </button>
            ))}{' '}
          </div>{' '}
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            {' '}
            과거 통합 인구 추정값은 “과거 통합 인구를 2026 인구비율로 배분”한
            결과입니다. 같은 통합 인구가 반복 입력된 구·군 합계는 중복 집계하지
            않습니다.{' '}
          </p>{' '}
        </section>{' '}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">분석 범위</h3>{' '}
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            {' '}
            과거 지도는 제공된 행정동별 인구 자료를 사용합니다. 신규·분할 동의
            결측은 0명으로 대체하지 않습니다. 2031년은 인구 시나리오이며 미래
            고령화율·의료기관 위치 자료는 없습니다.{' '}
          </p>{' '}
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            {' '}
            현재 분석의 수요 표현은 프로젝트 설명상 격자 인구 기반입니다. 원
            인구 격자 파일이 없어 격자 지도·크기·가중치·배분식은 재구성하지
            않았습니다. 건물 수와 과거 메타데이터를 현 분석 방법의 근거로
            사용하지 않습니다.{' '}
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
function getPopulationValue(
  record: DongRecord,
  year: AnalysisYear,
  view: PopulationView,
): number | null {
  if (view === 'change') return record.history.d_ratio_16_26;
  if (view === 'share') {
    if (year === 2016) return record.history.eld_ratio_2016;
    if (year === 2021) return record.history.eld_ratio_2021;
    if (year === 2026) return record.eld_ratio;
    return null;
  }
  if (year === 2016) return record.history.eld_2016;
  if (year === 2021) return record.history.eld_2021;
  if (year === 2026) return record.eld_65;
  return record.history.eld_2031;
}
function ComparisonCard({
  label,
  shareChange,
  shareCount,
  elderlyGrowth,
  growthCount,
}: {
  label: string;
  shareChange: number | null;
  shareCount: number;
  elderlyGrowth: number | null;
  growthCount: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-50 p-3">
      {' '}
      <p className="text-xs font-semibold text-slate-200">{label}</p>{' '}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        {' '}
        <div>
          {' '}
          <p className="text-slate-500">고령화율 변화 중앙값</p>{' '}
          <p className="mt-1 font-semibold text-white">
            {formatNumber(shareChange, 1)}%p{' '}
            <span className="font-normal text-slate-500">(n={shareCount})</span>
          </p>{' '}
        </div>{' '}
        <div>
          {' '}
          <p className="text-slate-500">고령인구 증가율 중앙값</p>{' '}
          <p className="mt-1 font-semibold text-white">
            {formatPercent(elderlyGrowth, 1)}{' '}
            <span className="font-normal text-slate-500">
              (n={growthCount})
            </span>
          </p>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
interface DistrictTrendPoint {
  year: number;
  share: number | null;
  validCount: number;
  areaCount: number;
}
function getDistrictTrend(
  records: DongRecord[],
  district: string,
): DistrictTrendPoint[] {
  const districtRecords = records.filter(
    (record) => record.sgg_nm === district,
  );
  const years = [
    {
      year: 2016,
      elderly: (record: DongRecord) => record.history.eld_2016,
      total: (record: DongRecord) => record.history.pop_2016,
    },
    {
      year: 2021,
      elderly: (record: DongRecord) => record.history.eld_2021,
      total: (record: DongRecord) => record.history.pop_2021,
    },
    {
      year: 2026,
      elderly: (record: DongRecord) => record.eld_65,
      total: (record: DongRecord) => record.pop_total,
    },
  ];
  return years.map(({ year, elderly, total }) => {
    const validRecords = districtRecords.filter(
      (record) => elderly(record) !== null && total(record) !== null,
    );
    const elderlyTotal = validRecords.reduce(
      (sum, record) => sum + (elderly(record) ?? 0),
      0,
    );
    const populationTotal = validRecords.reduce(
      (sum, record) => sum + (total(record) ?? 0),
      0,
    );
    return {
      year,
      share:
        populationTotal > 0 ? (elderlyTotal / populationTotal) * 100 : null,
      validCount: validRecords.length,
      areaCount: districtRecords.length,
    };
  });
}
