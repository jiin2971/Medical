import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { BarChart3, Network } from 'lucide-react';
import { DongDetailModal } from '@/components/DongDetailModal';
import { useDashboardData } from '@/data/useDashboardData';
import { policyTargetLabel } from '@/utils/format';
import type { DongRecord, LisaCluster } from '@/types/dashboard';
import {
  LISA_DEFINITION_HELP,
  LISA_INFO,
  isVulnerable,
} from '@/types/dashboard';
import { formatNumber, formatPercent } from '@/utils/format';
interface ScatterPoint {
  code: string;
  name: string;
  district: string | null;
  agingShare: number;
  access: number;
  elderlyPopulation: number;
  clusterName: string;
  pattern: string | null;
  lisa: LisaCluster | null;
}
const CLUSTER_COLORS: Record<string, string> = {
  평균형: '#38BDF8',
  '고령 1인가구 밀집형': '#A78BFA',
  '의료 양호형': '#34D399',
  '의료·교통 동시 취약형': '#F97316',
  도서형: '#F472B6',
};
export function ClusterAnalysis() {
  const { records, policies, byCode } = useDashboardData();
  const [clusterFilter, setClusterFilter] = useState('');
  const [patternFilter, setPatternFilter] = useState('');
  const [lisaFilter, setLisaFilter] = useState('');
  const [selectedDong, setSelectedDong] = useState<DongRecord | null>(null);
  const clusterNames = [
    ...new Set(
      records
        .map((record) => record.cluster_nm)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort();
  const patterns = [
    ...new Set(
      records
        .map((record) => record.pattern)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort();
  const lisaTypes: LisaCluster[] = ['HH', 'LL', 'HL', 'LH', 'NS'];
  const filteredRecords = records.filter(
    (record) =>
      (!clusterFilter || record.cluster_nm === clusterFilter) &&
      (!patternFilter || record.pattern === patternFilter) &&
      (!lisaFilter || record.lisa === lisaFilter),
  );
  const scatterPoints: ScatterPoint[] = filteredRecords.flatMap((record) => {
    if (
      record.eld_ratio === null ||
      record.acc_600 === null ||
      record.eld_65 === null
    )
      return [];
    return [
      {
        code: record.adm_cd,
        name: record.adm_nm,
        district: record.sgg_nm,
        agingShare: record.eld_ratio,
        access: record.acc_600,
        elderlyPopulation: record.eld_65,
        clusterName: record.cluster_nm ?? '자료 없음',
        pattern: record.pattern,
        lisa: record.lisa,
      },
    ];
  });
  const clusters = useMemo(() => {
    const groups = new Map<string, ScatterPoint[]>();
    for (const point of scatterPoints) {
      const values = groups.get(point.clusterName) ?? [];
      values.push(point);
      groups.set(point.clusterName, values);
    }
    return [...groups.entries()];
  }, [scatterPoints]);
  const lisaCounts = lisaTypes.reduce<Record<string, number>>(
    (counts, cluster) => {
      counts[cluster] = records.filter(
        (record) => record.lisa === cluster,
      ).length;
      return counts;
    },
    {},
  );
  const futureRelative = records.filter((record) =>
    isVulnerable(record.history.vuln_2031_rel),
  );
  const futureFixed = records.filter((record) =>
    isVulnerable(record.history.vuln_2031),
  );
  const relativeOverlap = futureRelative.filter((record) =>
    isVulnerable(record.vuln),
  ).length;
  const newVulnerable = records.filter(
    (record) =>
      record.vuln === '비취약' && isVulnerable(record.history.vuln_2031),
  );
  const selectPolicyArea = (code: string | null) => {
    if (code) setSelectedDong(byCode[code] ?? null);
  };
  return (
    <div className="flex flex-col gap-4">
      {' '}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
        {' '}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          {' '}
          <div>
            {' '}
            <div className="flex items-center gap-2">
              {' '}
              <Network size={18} className="text-violet-400" />{' '}
              <h2 className="text-base font-bold text-white">
                2026 공간군집과 접근성
              </h2>{' '}
            </div>{' '}
            <p className="mt-1 text-xs text-slate-400">
              {' '}
              LISA, K-means 군집명, 패턴은 서로 다른 원자료 분류입니다. 취약성
              점수를 만들지 않았습니다.{' '}
            </p>{' '}
          </div>{' '}
          <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">
            군집 결과 기준: 2026
          </span>{' '}
        </div>{' '}
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {' '}
          <FilterSelect
            label="K-means 군집명"
            value={clusterFilter}
            onChange={setClusterFilter}
            options={clusterNames}
          />{' '}
          <FilterSelect
            label="패턴 분류"
            value={patternFilter}
            onChange={setPatternFilter}
            options={patterns}
          />{' '}
          <FilterSelect
            label="LISA 접근성 군집"
            value={lisaFilter}
            onChange={setLisaFilter}
            options={lisaTypes}
          />{' '}
        </div>{' '}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          {' '}
          <div>
            {' '}
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              고령화율 × 600m 접근성
            </h3>{' '}
            <p className="mb-3 text-[11px] text-slate-400">
              {' '}
              점 크기: 65세 이상 인구 · 색상: cluster_nm · 축은 원자료
              단위입니다.{' '}
            </p>{' '}
            <div className="h-[460px] w-full">
              {' '}
              <ResponsiveContainer>
                {' '}
                <ScatterChart
                  margin={{ top: 12, right: 22, bottom: 26, left: 12 }}
                >
                  {' '}
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />{' '}
                  <XAxis
                    type="number"
                    dataKey="agingShare"
                    name="고령화율"
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="#475569"
                    label={{
                      value: '고령화율 (%)',
                      position: 'bottom',
                      fill: '#94a3b8',
                      fontSize: 11,
                      offset: 8,
                    }}
                  />{' '}
                  <YAxis
                    type="number"
                    dataKey="access"
                    name="600m 2SFCA 접근성"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="#475569"
                    label={{
                      value: '600m 2SFCA 접근성 지수(원자료 단위)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#94a3b8',
                      fontSize: 10,
                    }}
                  />{' '}
                  <ZAxis
                    type="number"
                    dataKey="elderlyPopulation"
                    name="65세 이상 인구"
                    range={[36, 320]}
                  />{' '}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0].payload as ScatterPoint;
                      return (
                        <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-xs ">
                          {' '}
                          <p className="font-bold text-white">
                            {point.name} · {point.district ?? '구·군 자료 없음'}
                          </p>{' '}
                          <p className="mt-1 text-slate-300">
                            고령화율: {formatPercent(point.agingShare)}
                          </p>{' '}
                          <p className="text-sky-300">
                            600m 접근성: {formatNumber(point.access, 4)}
                          </p>{' '}
                          <p className="text-violet-300">
                            65세 이상: {formatNumber(point.elderlyPopulation)}명
                          </p>{' '}
                          <p className="text-slate-400">
                            cluster_nm: {point.clusterName}
                          </p>{' '}
                          <p className="text-slate-400">
                            패턴: {point.pattern ?? '자료 없음'} · LISA:{' '}
                            {point.lisa ?? '자료 없음'}
                          </p>{' '}
                        </div>
                      );
                    }}
                  />{' '}
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#cbd5e1' }}
                    formatter={(name) => (
                      <span style={{ color: '#cbd5e1' }}>{name}</span>
                    )}
                  />{' '}
                  {clusters.map(([name, points]) => (
                    <Scatter
                      key={name}
                      name={name}
                      data={points}
                      fill={CLUSTER_COLORS[name] ?? '#94A3B8'}
                      fillOpacity={0.72}
                      stroke={CLUSTER_COLORS[name] ?? '#94A3B8'}
                    />
                  ))}{' '}
                </ScatterChart>{' '}
              </ResponsiveContainer>{' '}
            </div>{' '}
            <p className="mt-2 text-[10px] text-slate-500">
              유효한 고령화율·접근성·고령인구가 모두 있는 점{' '}
              {scatterPoints.length}개 / 필터 행정동 {filteredRecords.length}곳
            </p>{' '}
          </div>{' '}
          <div>
            {' '}
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              LISA 분포 (2026)
            </h3>{' '}
            <div className="space-y-2">
              {' '}
              {lisaTypes.map((cluster) => (
                <div
                  key={cluster}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-50 p-3"
                >
                  {' '}
                  <div>
                    {' '}
                    <p className="text-xs font-semibold text-white">
                      {LISA_INFO[cluster].label}
                    </p>{' '}
                    <p className="mt-1 text-[10px] text-slate-500">
                      {LISA_INFO[cluster].description}
                    </p>{' '}
                  </div>{' '}
                  <span className="ml-3 text-lg font-bold text-slate-200">
                    {lisaCounts[cluster] ?? 0}
                  </span>{' '}
                </div>
              ))}{' '}
            </div>{' '}
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
              {LISA_DEFINITION_HELP}
            </p>{' '}
            <p className="mt-2 text-[10px] text-slate-500">
              소문자 ns는 화면에 NS로 정규화했습니다.
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {' '}
          <ClassificationCounts
            title="K-means cluster_nm"
            counts={clusterNames.map(
              (name) =>
                [
                  name,
                  records.filter((record) => record.cluster_nm === name).length,
                ] as const,
            )}
          />{' '}
          <ClassificationCounts
            title="별도 pattern"
            counts={patterns.map(
              (name) =>
                [
                  name,
                  records.filter((record) => record.pattern === name).length,
                ] as const,
            )}
          />{' '}
        </div>{' '}
      </section>{' '}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        {' '}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {' '}
          <div className="flex items-center gap-2">
            {' '}
            <BarChart3 size={18} className="text-red-400" />{' '}
            <h3 className="text-sm font-bold text-white">
              제공 정책 우선순위
            </h3>{' '}
          </div>{' '}
          <p className="mt-1 text-[10px] text-slate-500">
            정책표의 rank 오름차순 · 2026 기준 · 행을 누르면 행정동 상세 표시
          </p>{' '}
          <div className="mt-3 max-h-[490px] overflow-auto rounded-xl border border-slate-200 scrollbar-thin">
            {' '}
            <table className="min-w-[640px] w-full text-left text-[11px]">
              {' '}
              <thead className="sticky top-0 bg-slate-800 text-slate-300">
                {' '}
                <tr>
                  {' '}
                  <th className="px-3 py-2">순위</th>{' '}
                  <th className="px-3 py-2">행정동</th>{' '}
                  <th className="px-3 py-2">취약 분류</th>{' '}
                  <th className="px-3 py-2">대상/권역</th>{' '}
                  <th className="px-3 py-2">정책</th>{' '}
                </tr>{' '}
              </thead>{' '}
              <tbody>
                {' '}
                {policies.map((policy) => (
                  <tr
                    key={`${policy.rank ?? 'none'}-${policy.adm_nm}`}
                    onClick={() => selectPolicyArea(policy.matchedAdmCd)}
                    className="cursor-pointer border-t border-slate-800 text-slate-300 hover:bg-slate-100"
                  >
                    {' '}
                    <td className="px-3 py-2">
                      {policy.rank ?? '자료 없음'}
                    </td>{' '}
                    <td className="px-3 py-2 font-semibold text-white">
                      {policy.adm_nm}
                    </td>{' '}
                    <td className="px-3 py-2">{policy.vuln ?? '자료 없음'}</td>{' '}
                    <td className="px-3 py-2">
                      {policyTargetLabel(
                        policy.unit,
                        policy.adm_nm,
                        policy.region,
                      )}
                    </td>{' '}
                    <td className="px-3 py-2">
                      {policy.policy ?? '자료 없음'}
                    </td>{' '}
                  </tr>
                ))}{' '}
              </tbody>{' '}
            </table>{' '}
          </div>{' '}
        </div>{' '}
        <div className="space-y-4">
          {' '}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            {' '}
            <h3 className="text-sm font-bold text-white">
              2031 취약 분류 시나리오
            </h3>{' '}
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {' '}
              현재 취약{' '}
              {records.filter((record) => isVulnerable(record.vuln)).length}곳 ·
              고정 기준선 분류 {futureFixed.length}곳 · 새 취약 분류{' '}
              {newVulnerable.length}곳{' '}
            </p>{' '}
            <p className="mt-2 text-[11px] text-slate-400">
              {' '}
              상대 2031 취약 31곳 중 현재 취약 분류와 겹치는 지역:{' '}
              {relativeOverlap}/{futureRelative.length}곳.{' '}
              {relativeOverlap === 29 && futureRelative.length === 31
                ? ' 상대 취약 순위 구조는 대체로 유지.'
                : ' 제공된 분석 설명의 중복 수치와 차이가 있어 확인이 필요합니다.'}{' '}
            </p>{' '}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {' '}
              {newVulnerable.map((record) => (
                <button
                  key={record.adm_cd}
                  onClick={() => setSelectedDong(record)}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-200 hover:bg-amber-100"
                >
                  {' '}
                  {record.adm_nm} · {record.sgg_nm ?? '구·군 자료 없음'}{' '}
                </button>
              ))}{' '}
            </div>{' '}
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
              {' '}
              2031년에는 LISA·K-means 군집·정책 결과가 제공되지 않았으며 별도
              계산하지 않았습니다.{' '}
            </p>{' '}
          </section>{' '}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            {' '}
            <h3 className="text-sm font-bold text-white">
              분류 해석 유의사항
            </h3>{' '}
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              {' '}
              cluster_nm은 제공된 유형명을 그대로 표시하며 숫자 군집 1–4와 별도
              범주 도서형을 구분합니다. pattern은 LISA 및 cluster_nm과 독립된
              분류입니다. LISA의 분석 변수·공간가중치 정의는 확인이
              필요합니다.{' '}
            </p>{' '}
          </section>{' '}
        </div>{' '}
      </section>{' '}
      <DongDetailModal
        metrics={selectedDong}
        onClose={() => setSelectedDong(null)}
      />{' '}
    </div>
  );
}
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-[10px] text-slate-500">
      {' '}
      {label}{' '}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200"
      >
        {' '}
        <option value="">전체</option>{' '}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}{' '}
      </select>{' '}
    </label>
  );
}
function ClassificationCounts({
  title,
  counts,
}: {
  title: string;
  counts: ReadonlyArray<readonly [string, number]>;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-50 p-3">
      {' '}
      <h4 className="text-xs font-semibold text-slate-300">{title}</h4>{' '}
      <div className="mt-2 flex flex-wrap gap-2">
        {' '}
        {counts.map(([label, count]) => (
          <span
            key={label}
            className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-300"
          >
            {' '}
            {label} <strong className="ml-1 text-white">{count}</strong>{' '}
          </span>
        ))}{' '}
      </div>{' '}
    </div>
  );
}
