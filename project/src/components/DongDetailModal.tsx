import { X } from 'lucide-react';
import type { DongRecord } from '@/types/dashboard';
import {
  ACC_INDEX_HELP,
  D_BUS_W_HELP,
  LISA_DEFINITION_HELP,
  POLICY_MISSING_LABEL,
  VULNERABILITY_INFO,
  vulnerabilityFromValue,
  isVulnerable,
} from '@/types/dashboard';
import { formatNumber, formatPercent, policyTargetLabel } from '@/utils/format';
interface DongDetailModalProps {
  metrics: DongRecord | null;
  onClose: () => void;
}
export function DongDetailModal({ metrics, onClose }: DongDetailModalProps) {
  if (!metrics) return null;
  const status = vulnerabilityFromValue(metrics.vuln);
  const detailRows = [
    ['행정구역 코드', metrics.adm_cd],
    ['구·군', metrics.sgg_nm ?? '자료 없음'],
    ['총인구', formatWithUnit(metrics.pop_total, '명')],
    ['65세 이상 인구', formatWithUnit(metrics.eld_65, '명')],
    ['고령 1인가구', formatWithUnit(metrics.eld_single, '가구')],
    ['고령화율', formatPercent(metrics.eld_ratio)],
    ['고령인구 대비 1인가구 비율', formatPercent(metrics.eld_single_ratio)],
    ['600m 2SFCA 접근성 지수(원자료 단위)', formatNumber(metrics.acc_600, 4)],
    ['1000m 2SFCA 접근성 지수(원자료 단위)', formatNumber(metrics.acc_1000, 4)],
    [
      '600m 내 적격 의료기관 없는 고령인구 비율',
      formatPercent(metrics.nofac_600_ratio),
    ],
    ['만성질환 의사 공급량 S 합계', formatNumber(metrics.doc_S_in_dong, 2)],
    ['고령인구 1,000명당 의사 공급', formatNumber(metrics.doc_per_1k_eld, 3)],
    ['가중 버스 거리(원자료 d_bus_w)', formatNumber(metrics.d_bus_w, 4)],
    ['기존 건물 수 메타데이터', formatNumber(metrics.building_count)],
    ['기존 접근성 포함 플래그', formatNumber(metrics.accessibility_eligible)],
    ['기존 제외 사유', metrics.exclusion_reason ?? '자료 없음'],
  ] as const;
  const history = metrics.history;
  const noChangeReason =
    metrics.acc_600 === 0 && history.acc_600_chg === null
      ? '원래0: 변화율 계산 불가'
      : formatPercent(history.acc_600_chg);
  const exclusionMismatch =
    metrics.building_count === 0 &&
    metrics.accessibility_eligible === 0 &&
    metrics.acc_600 !== null &&
    metrics.acc_600 !== 0;
  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-200 p-4 "
      onClick={onClose}
    >
      {' '}
      <section
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-900 scrollbar-thin"
        onClick={(event) => event.stopPropagation()}
      >
        {' '}
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4 ">
          {' '}
          <div>
            {' '}
            <p className="text-xs text-slate-400">
              {metrics.sgg_nm ?? '구·군 자료 없음'} · {metrics.adm_cd}
            </p>{' '}
            <h2 className="mt-1 text-xl font-bold text-white">
              {metrics.adm_nm}
            </h2>{' '}
            <p className="mt-1 text-xs text-slate-500">
              2026년 현재 분석 자료
            </p>{' '}
          </div>{' '}
          <button
            aria-label="상세 정보 닫기"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            {' '}
            <X size={20} />{' '}
          </button>{' '}
        </header>{' '}
        <div className="space-y-5 px-5 py-5">
          {' '}
          <section
            className="rounded-xl border p-4"
            style={{
              backgroundColor: '#f8f9fa',
              borderColor: '#e2e8f0',
            }}
          >
            {' '}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {' '}
              <h3
                className="font-semibold"
                style={{ color: VULNERABILITY_INFO[status].color }}
              >
                {' '}
                {VULNERABILITY_INFO[status].label}{' '}
              </h3>{' '}
              <span className="text-xs text-slate-400">
                {metrics.vuln ?? '자료 없음'}
              </span>{' '}
            </div>{' '}
            <p className="mt-1 text-xs text-slate-400">
              {VULNERABILITY_INFO[status].description}
            </p>{' '}
            {isVulnerable(metrics.vuln) && (
              <p className="mt-2 text-xs text-slate-300">
                {' '}
                기본 분류 외 민감도 값: 15 {metrics.vuln_15 ?? '자료 없음'} · 20{' '}
                {metrics.vuln_20 ?? '자료 없음'} · 25{' '}
                {metrics.vuln_25 ?? '자료 없음'}{' '}
              </p>
            )}{' '}
          </section>{' '}
          {exclusionMismatch && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-200">
              {' '}
              접근성 값과 기존 제외 플래그 불일치: 확인 필요{' '}
            </p>
          )}{' '}
          <section>
            {' '}
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              2026 현재 지표
            </h3>{' '}
            <div className="grid gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-2">
              {' '}
              {detailRows.map(([label, value]) => (
                <MetricRow key={label} label={label} value={value} />
              ))}{' '}
            </div>{' '}
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {ACC_INDEX_HELP} {D_BUS_W_HELP}
            </p>{' '}
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              {' '}
              doc_S_in_dong은 의료기관 수가 아니라 적격 만성질환 의사 공급 S의
              합계입니다.{' '}
            </p>{' '}
          </section>{' '}
          <section>
            {' '}
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              과거 인구 자료
            </h3>{' '}
            <div className="grid gap-2 sm:grid-cols-3">
              {' '}
              <HistoryCard
                year={2016}
                population={history.eld_2016}
                total={history.pop_2016}
                share={history.eld_ratio_2016}
              />{' '}
              <HistoryCard
                year={2021}
                population={history.eld_2021}
                total={history.pop_2021}
                share={history.eld_ratio_2021}
              />{' '}
              <HistoryCard
                year={2026}
                population={metrics.eld_65}
                total={metrics.pop_total}
                share={metrics.eld_ratio}
              />{' '}
            </div>{' '}
            {history.hist_merged === 1 && (
              <p className="mt-2 rounded-lg border border-sky-200 bg-sky-50 p-2 text-[11px] text-sky-200">
                {' '}
                추정: 과거 통합 인구를 2026 인구비율로 배분{' '}
              </p>
            )}{' '}
            <p className="mt-2 text-[11px] text-slate-400">
              {' '}
              2016–2026 고령화율 변화{' '}
              {history.d_ratio_16_26 === null
                ? '자료 없음'
                : `${formatNumber(history.d_ratio_16_26, 1)}%p`}{' '}
              · 고령인구 증가율 {formatPercent(history.eld_gr_16_26, 1)}{' '}
            </p>{' '}
          </section>{' '}
          {isVulnerable(metrics.vuln) && (
            <section className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              {' '}
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">
                정책 우선순위
              </p>{' '}
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {' '}
                {metrics.rank === null
                  ? '자료 없음'
                  : `${metrics.rank}순위`}{' '}
              </p>{' '}
              <p className="mt-3 text-xs font-semibold text-slate-500">
                주요 정책
              </p>{' '}
              <p className="mt-1 text-lg font-semibold leading-relaxed text-slate-900">
                {' '}
                {metrics.policy ?? POLICY_MISSING_LABEL}{' '}
              </p>{' '}
              <p className="mt-2 text-xs text-slate-500">
                {' '}
                정책 단위: {metrics.unit ?? '자료 없음'} · 대상:{' '}
                {policyTargetLabel(
                  metrics.unit,
                  metrics.adm_nm,
                  metrics.region,
                )}{' '}
              </p>{' '}
            </section>
          )}{' '}
          <section>
            {' '}
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              공간 분석·정책 근거
            </h3>{' '}
            {!isVulnerable(metrics.vuln) ? (
              <div className="rounded-xl border border-slate-800 bg-slate-50 px-3 py-3">
                {' '}
                <p className="text-xs text-slate-400">K-means 군집명</p>{' '}
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {metrics.cluster_nm ?? '자료 없음'}
                </p>{' '}
              </div>
            ) : (
              <>
                {' '}
                <div className="grid gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-2">
                  {' '}
                  <MetricRow
                    label="LISA 접근성 군집"
                    value={metrics.lisa ?? '자료 없음'}
                  />{' '}
                  <MetricRow
                    label="LISA p-value"
                    value={formatNumber(metrics.lisa_p, 4)}
                  />{' '}
                  <MetricRow
                    label="K-means 군집명"
                    value={metrics.cluster_nm ?? '자료 없음'}
                  />{' '}
                  <MetricRow
                    label="별도 패턴 분류"
                    value={metrics.pattern ?? '자료 없음'}
                  />{' '}
                  <MetricRow
                    label="행정동 정책 결합"
                    value={
                      metrics.policyJoinStatus === 'unique'
                        ? '이름으로 1:1 연결'
                        : POLICY_MISSING_LABEL
                    }
                  />{' '}
                  <MetricRow label="허브" value={metrics.hub ?? '자료 없음'} />{' '}
                  <MetricRow
                    label="정책 근거: acc_600_z"
                    value={formatNumber(metrics.acc_600_z, 3)}
                  />{' '}
                  <MetricRow
                    label="정책 근거: d_bus_w_z"
                    value={formatNumber(metrics.d_bus_w_z, 3)}
                  />{' '}
                  <MetricRow
                    label="정책 근거: eld_single_ratio_z"
                    value={formatNumber(metrics.eld_single_ratio_z, 3)}
                  />{' '}
                </div>{' '}
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                  {LISA_DEFINITION_HELP}
                </p>{' '}
                <p className="mt-1 text-[10px] text-slate-500">
                  표준화 근거(z)는 원자료 단위 지표와 구분해 표시했습니다.
                </p>{' '}
              </>
            )}{' '}
          </section>{' '}
          <section className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            {' '}
            <div className="mb-3">
              {' '}
              <h3 className="text-base font-bold text-slate-900">
                2031 공급 유지 시나리오
              </h3>{' '}
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                {' '}
                의료 공급이 2026년 수준으로 유지되는 경우의 원자료
                시나리오입니다.{' '}
              </p>{' '}
            </div>{' '}
            <div className="grid gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-2">
              {' '}
              <MetricRow
                label="2031 고령인구(주요 표시값)"
                value={formatWithUnit(history.eld_2031, '명')}
              />{' '}
              <MetricRow
                label="제공된 고령인구 증가율"
                value={formatPercent(history.eld_gr_26_31)}
              />{' '}
              <MetricRow
                label="2031 600m 접근성 지수"
                value={formatNumber(history.acc_600_2031, 4)}
              />{' '}
              <MetricRow
                label="2031 1000m 접근성 지수"
                value={formatNumber(history.acc_1000_2031, 4)}
              />{' '}
              <MetricRow label="600m 접근성 변화율" value={noChangeReason} />{' '}
              <ScenarioClassificationRow value={history.vuln_2031} />{' '}
              <MetricRow
                label="2031 상대 분류(참고)"
                value={history.vuln_2031_rel ?? '자료 없음'}
              />{' '}
            </div>{' '}
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {' '}
              2031년 LISA·군집·정책 결과를 새로 계산하지 않았습니다.{' '}
            </p>{' '}
          </section>{' '}
        </div>{' '}
      </section>{' '}
    </div>
  );
}
function HistoryCard({
  year,
  population,
  total,
  share,
}: {
  year: number;
  population: number | null;
  total: number | null;
  share: number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-50 p-3">
      {' '}
      <p className="text-xs font-semibold text-slate-300">{year}년</p>{' '}
      <p className="mt-2 text-[11px] text-slate-400">
        고령인구 {formatWithUnit(population, '명')}
      </p>{' '}
      <p className="mt-1 text-[11px] text-slate-400">
        총인구 {formatWithUnit(total, '명')}
      </p>{' '}
      <p className="mt-1 text-sm font-semibold text-white">
        고령화율 {formatPercent(share)}
      </p>{' '}
    </div>
  );
}
function formatWithUnit(value: number | null, unit: string): string {
  return value === null ? '자료 없음' : `${formatNumber(value)}${unit}`;
}
function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 bg-slate-50 px-3 py-2 text-xs">
      {' '}
      <span className="text-slate-400">{label}</span>{' '}
      <span className="break-all text-right font-medium text-slate-200">
        {value}
      </span>{' '}
    </div>
  );
}
function ScenarioClassificationRow({ value }: { value: string | null }) {
  const classification = vulnerabilityFromValue(value);
  const info = VULNERABILITY_INFO[classification];
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 bg-slate-50 px-3 py-2 text-xs">
      {' '}
      <span className="text-slate-400">2031 고정 기준선 분류</span>{' '}
      <span
        className="rounded-full px-2 py-1 text-right font-semibold"
        style={{ color: info.color, backgroundColor: '#f1f5f9' }}
      >
        {' '}
        {info.label}{' '}
      </span>{' '}
    </div>
  );
}
