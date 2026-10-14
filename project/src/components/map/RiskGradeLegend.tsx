import { VULNERABILITY_INFO, VULNERABILITY_ORDER } from '@/types/dashboard';
import type { AnalysisYear } from '@/types/dashboard';
export function VulnerabilityLegend({ year }: { year: AnalysisYear }) {
  const isScenario = year === 2031;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 ">
      {' '}
      <p className="mb-1 text-xs font-semibold text-slate-700">
        {' '}
        {isScenario ? '2031 시나리오 취약 분류' : '2026 기준 취약 분류'}{' '}
      </p>{' '}
      <p className="mb-2 text-[10px] text-slate-500">
        {' '}
        {isScenario
          ? '공급 유지 시나리오 고정 분류'
          : '모든 연도에서 동일 적용'}{' '}
      </p>{' '}
      <div className="space-y-1.5">
        {' '}
        {VULNERABILITY_ORDER.map((value) => {
          const item = VULNERABILITY_INFO[value];
          return (
            <div key={value} className="flex items-center gap-2">
              {' '}
              <span
                className="h-3.5 w-3.5 rounded-sm"
                style={{ background: item.color }}
              />{' '}
              <span className="text-[11px] text-slate-400">
                {item.label}
              </span>{' '}
            </div>
          );
        })}{' '}
      </div>{' '}
    </div>
  );
}
