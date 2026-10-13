import { RISK_GRADE_INFO, RISK_GRADE_ORDER } from '@/types/dashboard';

export function RiskGradeLegend() {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 shadow-xl">
      <p className="text-xs font-semibold text-slate-300 mb-2">의료 취약성 등급</p>
      <div className="space-y-1.5">
        {RISK_GRADE_ORDER.map((grade) => {
          const info = RISK_GRADE_INFO[grade];
          return (
            <div key={grade} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ background: info.color }}
              />
              <span className="text-[11px] text-slate-400">
                {info.emoji} {info.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
