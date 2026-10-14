import { useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer } from 'leaflet';
import { MapPinned, ShieldAlert } from 'lucide-react';
import { IncheonMap } from '@/components/map/IncheonMap';
import { ElderlyRatioGradient } from '@/components/map/ElderlyRatioGradient';
import { GradientLegend } from '@/components/map/GradientLegend';
import { MapNavigation } from '@/components/map/MapNavigation';
import { VulnerabilityLegend } from '@/components/map/RiskGradeLegend';
import { TimeSlider } from '@/components/map/TimeSlider';
import { DongDetailModal } from '@/components/DongDetailModal';
import { PersonaCards } from '@/components/PersonaCards';
import { useDashboardData } from '@/data/useDashboardData';
import type { AnalysisYear, DongRecord } from '@/types/dashboard';
import {
  has2016PopulationData,
  POLICY_MISSING_LABEL,
  SCENARIO_NOTICE,
  VULNERABILITY_INFO,
  vulnerabilityFromValue,
  isVulnerable,
} from '@/types/dashboard';
import { vulnerabilityColor } from '@/utils/colors';
import { formatNumber, formatPercent, policyTargetLabel } from '@/utils/format';
export function MainDashboard() {
  const { records, boundaries, policies, byCode, validation } =
    useDashboardData();
  const [selectedYear, setSelectedYear] = useState<AnalysisYear>(2026);
  const [selectedDistrict, setSelectedDistrict] = useState('인천 전체');
  const [selectedDong, setSelectedDong] = useState<DongRecord | null>(null);
  const districts = [
    '인천 전체',
    ...new Set(
      records
        .map((record) => record.sgg_nm)
        .filter((district): district is string => Boolean(district)),
    ),
  ];
  const districtRecords =
    selectedDistrict === '인천 전체'
      ? records
      : records.filter((record) => record.sgg_nm === selectedDistrict);
  const missing2016Records = records.filter(
    (record) => !has2016PopulationData(record),
  );
  const populationRows = districtRecords.flatMap((record) => {
    const elderly = getElderlyPopulation(record, selectedYear);
    const total = getTotalPopulation(record, selectedYear);
    return elderly === null ? [] : [{ elderly, total }];
  });
  const elderlyPopulation = populationRows.reduce(
    (sum, row) => sum + row.elderly,
    0,
  );
  const shareRows = populationRows.filter((row) => row.total !== null);
  const totalPopulation = shareRows.reduce(
    (sum, row) => sum + (row.total ?? 0),
    0,
  );
  const shareElderlyPopulation = shareRows.reduce(
    (sum, row) => sum + row.elderly,
    0,
  );
  const overallElderlyShare =
    shareRows.length > 0 && totalPopulation > 0
      ? (shareElderlyPopulation / totalPopulation) * 100
      : null;
  const accessRows = districtRecords.flatMap((record) => {
    const elderly = getElderlyPopulation(record, selectedYear);
    const access = getAccess(record, selectedYear);
    return elderly === null || access === null ? [] : [{ elderly, access }];
  });
  const weightedElderlyPopulation = accessRows.reduce(
    (sum, row) => sum + row.elderly,
    0,
  );
  const weightedAccess =
    weightedElderlyPopulation > 0
      ? accessRows.reduce((sum, row) => sum + row.access * row.elderly, 0) /
        weightedElderlyPopulation
      : null;
  const currentVulnerableCount = districtRecords.filter((record) =>
    isVulnerable(record.vuln),
  ).length;
  const futureVulnerable = districtRecords.filter((record) =>
    isVulnerable(record.history.vuln_2031),
  ).length;
  const newlyVulnerable = districtRecords.filter(
    (record) =>
      record.vuln === '비취약' && isVulnerable(record.history.vuln_2031),
  );
  const classificationCounts = districtRecords.reduce<Record<string, number>>(
    (result, record) => {
      const value = vulnerabilityFromValue(
        selectedYear === 2031 ? record.history.vuln_2031 : record.vuln,
      );
      result[value] = (result[value] ?? 0) + 1;
      return result;
    },
    {},
  );
  const selectedPolicy = (code: string) => {
    const record = byCode[code];
    if (record) {
      setSelectedDong(record);
      if (record.sgg_nm) setSelectedDistrict(record.sgg_nm);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      {' '}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
        {' '}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          {' '}
          <TimeSlider
            year={selectedYear}
            onChange={setSelectedYear}
            label="종합 현황 표시 연도"
          />{' '}
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-600">
            {' '}
            구·군 통계 범위{' '}
            <select
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              aria-label="종합 현황 구·군 선택"
              className="max-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
            >
              {' '}
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}{' '}
            </select>{' '}
          </label>{' '}
        </div>{' '}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {' '}
          <SummaryCard
            label={`${selectedYear}년 고령인구`}
            value={`${formatNumber(elderlyPopulation)}명`}
            detail={`유효 ${populationRows.length}/${districtRecords.length}개 행정동 · ${selectedDistrict}`}
            icon={<MapPinned size={18} />}
          />{' '}
          <SummaryCard
            label={`${selectedYear}년 고령화율`}
            value={formatPercent(overallElderlyShare)}
            detail={
              selectedYear === 2031
                ? '2031 총인구가 없어 산출하지 않음'
                : `총인구·고령인구 모두 유효 ${shareRows.length}/${districtRecords.length}개 행정동`
            }
            icon={<MapPinned size={18} />}
          />{' '}
          <SummaryCard
            label={
              selectedYear === 2031
                ? '2031 시나리오 접근성'
                : `${selectedYear}년 600m 접근성`
            }
            value={formatNumber(weightedAccess, 4)}
            detail={
              selectedYear < 2026
                ? '과거 접근성 자료 없음'
                : `고령인구 가중 2SFCA 원자료 단위 · 유효 ${accessRows.length}/${districtRecords.length}곳`
            }
            icon={<MapPinned size={18} />}
          />{' '}
          <SummaryCard
            label={
              selectedYear === 2031
                ? '2031 취약 분류(확정·경계)'
                : `${selectedYear}년 취약 분류(확정·경계)`
            }
            value={
              selectedYear < 2026
                ? '자료 없음'
                : `${selectedYear === 2031 ? futureVulnerable : currentVulnerableCount}곳`
            }
            detail={
              selectedYear === 2026
                ? '2026년 제공 분류 기준'
                : selectedYear === 2031
                  ? `현재 비취약 중 새 포함 ${newlyVulnerable.length}곳`
                  : '과거 연도별 취약 분류 자료 없음'
            }
            icon={<ShieldAlert size={18} />}
          />{' '}
        </div>{' '}
        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
          {' '}
          2016·2021년은 인구 자료만 제공됩니다. 취약 분류와 의료 접근성은 2026
          현재 또는 2031 공급 유지 시나리오 값만 표시하며, 없는 기간은 추정하지
          않습니다.{' '}
        </p>{' '}
        {selectedYear === 2016 && missing2016Records.length > 0 && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900"
          >
            신설·분할 동 (2016 자료 없음) · {missing2016Records.length}곳:{' '}
            {missing2016Records.map((record) => record.adm_nm).join(', ')}. 이
            동들은 현재 행정동 및 지도 경계에 포함되며 2016 비교 통계만 집계에서
            제외됩니다.
          </div>
        )}{' '}
      </section>{' '}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
        {' '}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          {' '}
          <div>
            {' '}
            <h2 className="text-base font-bold text-slate-900">
              {' '}
              {selectedYear === 2016 || selectedYear === 2021
                ? `${selectedYear}년 고령화율 공간 보간`
                : selectedYear === 2031
                  ? '2031년 시나리오 · 2026 고령화율 보간'
                  : '2026년 고령화율 공간 보간'}{' '}
            </h2>{' '}
            <p className="mt-1 text-xs text-slate-600">
              {' '}
              {selectedYear === 2016 || selectedYear === 2021
                ? '행정동 고령화율을 기준으로 IDW 연속 보간합니다. 색상 구간은 2026년 분포에 고정하고, 경계는 구분을 위해 얇게 표시합니다.'
                : selectedYear === 2031
                  ? '2031년 총인구·고령화율은 제공되지 않아 지도 면색은 2026년 고령화율 보간을 유지합니다. 라벨은 2031년 고령인구 증가율입니다.'
                  : '2026년 고령화율을 IDW로 연속 보간합니다. 취약 분류와 별개인 인구 지표입니다.'}{' '}
            </p>{' '}
          </div>{' '}
          <div className="flex flex-wrap items-center gap-2">
            {' '}
            <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600">
              {' '}
              고령화율 · 고정 구간{' '}
            </span>{' '}
            {selectedYear === 2016 && (
              <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-300" />
                2016 자료 없음
              </span>
            )}{' '}
          </div>{' '}
        </div>{' '}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {' '}
          <div className="relative h-[560px] overflow-hidden rounded-xl border border-slate-200">
            {' '}
            <IncheonMap labelYear={selectedYear}>
              {' '}
              <ElderlyRatioGradient year={selectedYear} />{' '}
              <GeoJSON
                key={selectedYear}
                data={boundaries}
                interactive
                style={(feature) => {
                  const code = feature?.properties?.adm_cd;
                  const record =
                    typeof code === 'string' ? byCode[code] : undefined;
                  const classification =
                    selectedYear === 2031
                      ? record?.history.vuln_2031
                      : record?.vuln;
                  return {
                    fillColor:
                      selectedYear === 2016 &&
                      record &&
                      !has2016PopulationData(record)
                        ? '#CBD5E1'
                        : vulnerabilityColor(classification),
                    fillOpacity: 0.82,
                    color: 'transparent',
                    opacity: 0,
                    weight: 0,
                  };
                }}
                onEachFeature={(feature, layer: Layer) => {
                  const code = feature.properties?.adm_cd;
                  const record =
                    typeof code === 'string' ? byCode[code] : undefined;
                  if (!record) return;
                  layer.on('click', () => setSelectedDong(record));
                }}
              />{' '}
              <MapNavigation
                boundaries={boundaries}
                onSelectCode={selectedPolicy}
              />{' '}
            </IncheonMap>{' '}
            <div className="absolute bottom-3 right-3 z-[900]">
              {' '}
              <div className="space-y-2">
                <VulnerabilityLegend year={selectedYear} />
                <GradientLegend
                  title="고령화율 IDW · 2026 기준"
                  minLabel="낮음 ≤ 13.6%"
                  maxLabel="높음 ≥ 44.8%"
                  gradient="linear-gradient(90deg, #27AE60 0%, #F1C40F 31.3%, #E67E22 47%, #E74C3C 100%)"
                />
                <p className="rounded border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-600">
                  기본 반경 5.5km · 동 크기별 최대 12km · 불투명도 62%
                </p>
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="min-w-0">
            {' '}
            <p className="mb-2 text-[10px] font-semibold text-slate-500">
              취약 분류 · {selectedDistrict}
            </p>{' '}
            <p className="mb-2 text-[9px] text-slate-500">
              {' '}
              {selectedYear === 2031
                ? '2031 공급 유지 시나리오 고정 분류'
                : '2016·2021·2026에는 2026 기준 분류를 표시'}{' '}
            </p>{' '}
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {' '}
              {(['확정', '경계', '비취약', 'missing'] as const).map((value) => (
                <div
                  key={value}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  {' '}
                  <p className="text-[11px] text-slate-400">
                    {VULNERABILITY_INFO[value].label}
                  </p>{' '}
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {' '}
                    {classificationCounts[value] ?? 0}곳{' '}
                  </p>{' '}
                </div>
              ))}{' '}
            </div>{' '}
            <div className="max-h-[495px] overflow-auto rounded-xl border border-slate-200 scrollbar-thin">
              {' '}
              <table className="min-w-[900px] w-full text-left text-[11px]">
                {' '}
                <thead className="sticky top-0 bg-slate-800 text-slate-300">
                  {' '}
                  <tr>
                    {' '}
                    <th className="px-2 py-2">순위</th>{' '}
                    <th className="px-2 py-2">행정동</th>{' '}
                    <th className="px-2 py-2">취약</th>{' '}
                    <th className="px-2 py-2">패턴</th>{' '}
                    <th className="px-2 py-2">단위</th>{' '}
                    <th className="px-2 py-2">군집명</th>{' '}
                    <th className="px-2 py-2">정책</th>{' '}
                    <th className="px-2 py-2">대상/권역</th>{' '}
                    <th className="px-2 py-2">65세+ (2026)</th>{' '}
                    <th className="px-2 py-2">독거노인 (2026)</th>{' '}
                  </tr>{' '}
                </thead>{' '}
                <tbody>
                  {' '}
                  {policies.map((policy) => (
                    <tr
                      key={`${policy.rank ?? 'none'}-${policy.adm_nm}`}
                      onClick={() =>
                        policy.matchedAdmCd &&
                        selectedPolicy(policy.matchedAdmCd)
                      }
                      className="cursor-pointer border-t border-slate-800 text-slate-300 hover:bg-slate-100"
                    >
                      {' '}
                      <td className="px-2 py-2">
                        {policy.rank ?? '자료 없음'}
                      </td>{' '}
                      <td className="px-2 py-2 font-semibold text-white">
                        {policy.adm_nm}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {policy.vuln ?? '자료 없음'}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {policy.pattern ?? '자료 없음'}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {policy.unit ?? '자료 없음'}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {policy.cluster_nm ?? '자료 없음'}
                      </td>{' '}
                      <td className="max-w-56 px-2 py-2">
                        {policy.policy ?? '자료 없음'}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {policyTargetLabel(
                          policy.unit,
                          policy.adm_nm,
                          policy.region,
                        )}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {formatNumber(policy.eld_65)}
                      </td>{' '}
                      <td className="px-2 py-2">
                        {formatNumber(policy.eld_single)}
                      </td>{' '}
                    </tr>
                  ))}{' '}
                </tbody>{' '}
              </table>{' '}
              <p className="sticky bottom-0 border-t border-slate-800 bg-slate-900 px-3 py-2 text-[10px] text-slate-500">
                {' '}
                표는 제공된 정책 순위 기준으로 정렬했습니다. 정책이 없는
                행정동에는 “{POLICY_MISSING_LABEL}”을 적용합니다.{' '}
              </p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
      <PersonaCards
        records={records}
        policies={policies}
        onSelectDong={setSelectedDong}
      />{' '}
      <section className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        {' '}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-slate-900">
            2031 고정 기준선 시나리오 · {selectedDistrict}
          </h3>{' '}
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {' '}
            현재 취약 분류 {currentVulnerableCount}곳에서 2031년 시나리오 취약
            분류는 {futureVulnerable}곳으로 늘고, 현재 비취약 중{' '}
            {newlyVulnerable.length}곳이 새로 취약 분류에 포함됩니다.{' '}
          </p>{' '}
          <div className="mt-3 flex flex-wrap gap-2">
            {' '}
            {newlyVulnerable.map((record) => (
              <button
                key={record.adm_cd}
                onClick={() => setSelectedDong(record)}
                className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-200 hover:bg-amber-100"
              >
                {' '}
                {record.adm_nm} · {record.sgg_nm ?? '구·군 자료 없음'}{' '}
              </button>
            ))}{' '}
          </div>{' '}
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            {SCENARIO_NOTICE}
          </p>{' '}
        </div>{' '}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <h3 className="text-sm font-bold text-white">자료 결합 검증</h3>{' '}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {' '}
            <ValidationRow
              label="현재 master ↔ 경계"
              value={`${validation.currentRowCount} / ${validation.boundaryFeatureCount}`}
            />{' '}
            <ValidationRow
              label="과거·미래 master"
              value={`${validation.historyRowCount}행`}
            />{' '}
            <ValidationRow
              label="의료기관 연결"
              value={`${validation.matchedFacilityCount} 연결 · ${validation.unmatchedFacilityCount} 미연결`}
            />{' '}
            <ValidationRow
              label="정책 우선순위"
              value={`${validation.policyRowCount}행`}
            />{' '}
          </div>{' '}
          {validation.warnings.length > 0 && (
            <div className="mt-3 space-y-1 border-t border-slate-800 pt-3">
              {' '}
              {validation.warnings.map((warning) => (
                <p
                  key={warning}
                  className="text-[10px] leading-relaxed text-amber-300"
                >
                  {warning}
                </p>
              ))}{' '}
            </div>
          )}{' '}
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            {' '}
            고령인구 가중 접근성은 유효한 acc_600·eld_65 행만 사용하며, 위
            카드에 포함 행정동 수를 표시합니다.{' '}
          </p>{' '}
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            {' '}
            제공 파일에 원도심 여부를 정의하는 분류는 없어 원도심 집중 여부는
            별도 판정하지 않았습니다. region·hub는 채워진 원자료 값만
            표시합니다.{' '}
          </p>{' '}
        </div>{' '}
      </section>{' '}
      <DongDetailModal
        metrics={selectedDong}
        onClose={() => setSelectedDong(null)}
      />{' '}
    </div>
  );
}
function getElderlyPopulation(
  record: DongRecord,
  year: AnalysisYear,
): number | null {
  if (year === 2016) return record.history.eld_2016;
  if (year === 2021) return record.history.eld_2021;
  if (year === 2026) return record.eld_65;
  return record.history.eld_2031;
}
function getTotalPopulation(
  record: DongRecord,
  year: AnalysisYear,
): number | null {
  if (year === 2016) return record.history.pop_2016;
  if (year === 2021) return record.history.pop_2021;
  if (year === 2026) return record.pop_total;
  return null;
}
function getAccess(record: DongRecord, year: AnalysisYear): number | null {
  if (year === 2026) return record.acc_600;
  if (year === 2031) return record.history.acc_600_2031;
  return null;
}
function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {' '}
      <div className="flex items-center gap-2 text-slate-400">
        {' '}
        <span className="text-red-400">{icon}</span>{' '}
        <span className="text-xs">{label}</span>{' '}
      </div>{' '}
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>{' '}
      <p className="mt-1 text-[10px] text-slate-500">{detail}</p>{' '}
    </div>
  );
}
function ValidationRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      {' '}
      <span className="text-slate-400">{label}</span>{' '}
      <span className="text-right font-medium text-slate-200">
        {value}
      </span>{' '}
    </>
  );
}
