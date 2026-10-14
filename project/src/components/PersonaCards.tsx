import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DongRecord, PolicyPriorityRow } from '@/types/dashboard';
import { PERSONA_DATA } from '@/data/personas';
import { isVulnerable } from '@/types/dashboard';
import { formatNumber, formatPercent, median } from '@/utils/format';
interface PersonaCardsProps {
  records: DongRecord[];
  policies: PolicyPriorityRow[];
  onSelectDong: (record: DongRecord) => void;
}
export function PersonaCards({
  records,
  policies,
  onSelectDong,
}: PersonaCardsProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const regionalAccessMedian = median(
    records.flatMap((record) =>
      record.acc_600 === null ? [] : [record.acc_600],
    ),
  );
  const regionalSingleShareMedian = median(
    records.flatMap((record) =>
      record.eld_single_ratio === null ? [] : [record.eld_single_ratio],
    ),
  );
  const slides = useMemo(
    () =>
      PERSONA_DATA.map((persona) => {
        const members = records.filter(
          (record) => record.cluster_nm === persona.clusterName,
        );
        const linkedPolicies = policies
          .filter(
            (policy) =>
              policy.cluster_nm === persona.clusterName && policy.policy,
          )
          .sort(
            (left, right) =>
              (left.rank ?? Number.POSITIVE_INFINITY) -
              (right.rank ?? Number.POSITIVE_INFINITY),
          );
        const patterns = members.reduce<Record<string, number>>(
          (counts, record) => {
            if (record.pattern)
              counts[record.pattern] = (counts[record.pattern] ?? 0) + 1;
            return counts;
          },
          {},
        );
        const elderlyShare = median(
          members.flatMap((record) =>
            record.eld_ratio === null ? [] : [record.eld_ratio],
          ),
        );
        const singleShare = median(
          members.flatMap((record) =>
            record.eld_single_ratio === null ? [] : [record.eld_single_ratio],
          ),
        );
        const access = median(
          members.flatMap((record) =>
            record.acc_600 === null ? [] : [record.acc_600],
          ),
        );
        const observedIndicators = [
          access !== null && regionalAccessMedian !== null
            ? `600m 접근성 중앙값 ${access < regionalAccessMedian ? '미만' : '이상'}`
            : null,
          singleShare !== null && regionalSingleShareMedian !== null
            ? `고령 1인가구 비율 중앙값 ${singleShare > regionalSingleShareMedian ? '초과' : '이하'}`
            : null,
        ].filter((value): value is string => value !== null);
        return {
          ...persona,
          members,
          linkedPolicies,
          patterns,
          elderlyShare,
          singleShare,
          access,
          busDistance: median(
            members.flatMap((record) =>
              record.d_bus_w === null ? [] : [record.d_bus_w],
            ),
          ),
          vulnerableCount: members.filter((record) => isVulnerable(record.vuln))
            .length,
          observedIndicators,
        };
      }),
    [records, policies, regionalAccessMedian, regionalSingleShareMedian],
  );
  const slideIndex = Math.min(activeSlide, Math.max(0, slides.length - 1));
  const slide = slides[slideIndex];
  const goTo = (nextIndex: number) => {
    setActiveSlide((nextIndex + slides.length) % slides.length);
  };
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
      {' '}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        {' '}
        <div>
          {' '}
          <h2 className="text-base font-bold text-slate-900">
            유형별 페르소나 · 2026 현재
          </h2>{' '}
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">
            {' '}
            편집 가능한 유형별 예시와 실제 행정동 집계지표·정책표 권고를 함께
            표시합니다.{' '}
          </p>{' '}
        </div>{' '}
        <span className="text-xs font-medium text-slate-500">
          {' '}
          {slides.length > 0
            ? `${slideIndex + 1} / ${slides.length}`
            : '자료 없음'}{' '}
        </span>{' '}
      </div>{' '}
      <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-950">
        {' '}
        <strong>허구의 예시입니다.</strong> 이름·연령·인용문·위치
        설명·도전과제는 사용자가 제공한 가상 페르소나 콘텐츠이며 실제 주민
        인터뷰, 검증된 시설·이동시간·서비스 현황을 나타내지 않습니다. 아래 집계
        지표와 정책 권고만 제공 자료에서 연결합니다.{' '}
      </p>{' '}
      {slide ? (
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="유형별 페르소나"
          aria-live="polite"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') goTo(slideIndex - 1);
            if (event.key === 'ArrowRight') goTo(slideIndex + 1);
          }}
          className="rounded-2xl border border-slate-200 bg-white p-4 outline-none focus-visible:ring-2 focus-visible:ring-sky-600 sm:p-6"
        >
          {' '}
          <div className="flex flex-wrap items-start justify-between gap-3">
            {' '}
            <div>
              {' '}
              <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                원자료 cluster_nm · 2026 기준
              </p>{' '}
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {slide.typeTitle}
              </h3>{' '}
              <p className="mt-1 text-xs text-slate-500">
                {' '}
                {slide.members.length}개 행정동 · 현재 확정·경계{' '}
                {slide.vulnerableCount}곳{' '}
              </p>{' '}
            </div>{' '}
            <div className="flex items-center gap-2">
              {' '}
              <button
                type="button"
                aria-label="이전 페르소나"
                onClick={() => goTo(slideIndex - 1)}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
              >
                {' '}
                <ChevronLeft size={18} />{' '}
              </button>{' '}
              <button
                type="button"
                aria-label="다음 페르소나"
                onClick={() => goTo(slideIndex + 1)}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
              >
                {' '}
                <ChevronRight size={18} />{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            {' '}
            <section className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              {' '}
              <p className="text-[10px] font-semibold text-sky-800">
                가상 인물 · 실제 주민 아님
              </p>{' '}
              <h4 className="mt-2 text-base font-bold text-slate-900">
                {slide.name} · {slide.age}세
              </h4>{' '}
              <p className="mt-1 text-xs text-slate-600">{slide.location}</p>{' '}
              <blockquote className="mt-3 border-l-2 border-sky-400 pl-3 text-sm leading-relaxed text-slate-700">
                {' '}
                “{slide.quote}”{' '}
              </blockquote>{' '}
              <p className="mt-4 text-xs font-semibold text-slate-800">
                예시에서 제시한 도전과제
              </p>{' '}
              <ul className="mt-2 space-y-2">
                {' '}
                {slide.challenges.map((challenge) => (
                  <li
                    key={challenge}
                    className="flex gap-2 text-xs leading-relaxed text-slate-700"
                  >
                    {' '}
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                    />{' '}
                    {challenge}{' '}
                  </li>
                ))}{' '}
              </ul>{' '}
            </section>{' '}
            <section>
              {' '}
              <h4 className="text-xs font-semibold text-slate-700">
                실제 행정동 지표 · 유형 내 중앙값
              </h4>{' '}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {' '}
                <PersonaMetric
                  label="고령화율"
                  value={formatPercent(slide.elderlyShare)}
                />{' '}
                <PersonaMetric
                  label="고령 1인가구 비율"
                  value={formatPercent(slide.singleShare)}
                />{' '}
                <PersonaMetric
                  label="600m 접근성 지수"
                  value={formatNumber(slide.access, 4)}
                />{' '}
                <PersonaMetric
                  label="d_bus_w (단위 미확인)"
                  value={formatNumber(slide.busDistance, 2)}
                />{' '}
              </div>{' '}
              <p className="mt-3 text-[10px] font-semibold text-slate-500">
                인천 전체 중앙값 기준 관측
              </p>{' '}
              <div className="mt-1 flex flex-wrap gap-1.5">
                {' '}
                {slide.observedIndicators.length > 0 ? (
                  slide.observedIndicators.map((indicator) => (
                    <span
                      key={indicator}
                      className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] text-sky-800"
                    >
                      {' '}
                      {indicator}{' '}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500">
                    비교 가능한 값 없음
                  </span>
                )}{' '}
              </div>{' '}
              <p className="mt-4 text-[10px] font-semibold text-slate-500">
                원자료 pattern 분포
              </p>{' '}
              <div className="mt-1 flex flex-wrap gap-1.5">
                {' '}
                {Object.entries(slide.patterns).map(([pattern, count]) => (
                  <span
                    key={pattern}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600"
                  >
                    {' '}
                    {pattern} {count}{' '}
                  </span>
                ))}{' '}
              </div>{' '}
              <h4 className="mt-5 text-xs font-semibold text-slate-700">
                정책표 권고 · 행정동별
              </h4>{' '}
              {slide.linkedPolicies.length > 0 ? (
                <div className="mt-2 max-h-52 divide-y divide-slate-200 overflow-y-auto rounded-xl border border-slate-200 scrollbar-thin">
                  {' '}
                  {slide.linkedPolicies.map((policy) => {
                    const record = records.find(
                      (member) => member.adm_nm === policy.adm_nm,
                    );
                    return (
                      <div
                        key={`${slide.id}-${policy.rank ?? 'none'}-${policy.adm_nm}`}
                        className="flex items-start justify-between gap-3 p-3"
                      >
                        {' '}
                        <div>
                          {' '}
                          <p className="text-xs font-semibold text-slate-800">
                            {' '}
                            {policy.rank === null
                              ? ''
                              : `${policy.rank}순위 · `}
                            {policy.adm_nm}{' '}
                            {policy.region ? ` · ${policy.region}` : ''}{' '}
                          </p>{' '}
                          <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                            {policy.policy ?? '자료 없음'}
                          </p>{' '}
                          {policy.unit && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              정책 단위: {policy.unit}
                            </p>
                          )}{' '}
                        </div>{' '}
                        {record && (
                          <button
                            type="button"
                            onClick={() => onSelectDong(record)}
                            className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-100"
                          >
                            {' '}
                            상세{' '}
                          </button>
                        )}{' '}
                      </div>
                    );
                  })}{' '}
                </div>
              ) : (
                <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  연결된 정책표 권고가 없습니다.
                </p>
              )}{' '}
            </section>{' '}
          </div>{' '}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          페르소나를 표시할 수 없습니다.
        </p>
      )}{' '}
      {slides.length > 1 && (
        <div
          className="mt-3 flex justify-center gap-2"
          aria-label="페르소나 슬라이드 선택"
        >
          {' '}
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${index + 1}번 페르소나: ${item.typeTitle}`}
              aria-current={index === slideIndex ? 'true' : undefined}
              onClick={() => goTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === slideIndex ? 'bg-sky-700 ring-2 ring-sky-200' : 'bg-slate-300 hover:bg-slate-500'}`}
            />
          ))}{' '}
        </div>
      )}{' '}
    </section>
  );
}
function PersonaMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      {' '}
      <p className="text-[10px] text-slate-500">{label}</p>{' '}
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>{' '}
    </div>
  );
}
