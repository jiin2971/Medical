import { X, AlertTriangle, Pill, Stethoscope, Building2, Activity, Bus, UserRound, Cross } from 'lucide-react';
import type { DongMetrics } from '@/types/dashboard';
import { RISK_GRADE_INFO, LISA_INFO } from '@/types/dashboard';
import { getPolicySolutions } from '@/data/mockData';

interface DongDetailModalProps {
  metrics: DongMetrics | null;
  onClose: () => void;
}

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

const priorityLabels: Record<string, string> = {
  high: '최우선',
  medium: '중간',
  low: '장기',
};

export function DongDetailModal({ metrics, onClose }: DongDetailModalProps) {
  if (!metrics) return null;

  const grade = RISK_GRADE_INFO[metrics.riskGrade];
  const solutions = getPolicySolutions(metrics);

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto scrollbar-thin shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 px-6 py-4 border-b border-slate-700/50 flex items-start justify-between"
          style={{ background: `linear-gradient(135deg, ${grade.color}25, rgba(15,23,42,0.95))` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{grade.emoji}</span>
              <h2 className="text-xl font-bold text-white">{metrics.name}</h2>
            </div>
            <p className="text-sm text-slate-400">{metrics.nameEng} · {metrics.year}년 기준</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div
            className="rounded-xl p-3 border"
            style={{
              background: `${grade.color}15`,
              borderColor: `${grade.color}40`,
            }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: grade.color }}>
              {grade.emoji} {grade.label}
            </p>
            <p className="text-xs text-slate-400">{grade.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-red-400" />
              상세 지표
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<UserRound size={18} />}
                label="의사 수"
                value={String(metrics.doctorsCount)}
                sublabel="해당 지역 의사"
                color="text-violet-400"
              />
              <MetricCard
                icon={<Bus size={18} />}
                label="대중교통 접근성"
                value={metrics.transportAccessibility.toFixed(1)}
                sublabel="교통 접근성 점수"
                color="text-emerald-400"
              />
              <MetricCard
                icon={<Activity size={18} />}
                label="고령화율"
                value={`${metrics.agingRate.toFixed(1)}%`}
                sublabel={`${metrics.agingPopulation.toLocaleString()}명 / ${metrics.totalPopulation.toLocaleString()}명`}
                color="text-orange-400"
              />
              <MetricCard
                icon={<AlertTriangle size={18} />}
                label="취약성 점수"
                value={`${metrics.vulnerabilityScore}`}
                sublabel="0-100 점"
                color="text-red-400"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Stethoscope size={16} className="text-emerald-400" />
              의료 시설 현황
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <FacilityCard icon={<Building2 size={18} />} label="대형병원" value={metrics.majorHospitals} />
              <FacilityCard icon={<Stethoscope size={18} />} label="소형의원" value={metrics.smallClinics} />
              <FacilityCard icon={<Pill size={18} />} label="약국" value={metrics.pharmacies} />
              <FacilityCard icon={<Cross size={18} />} label="응급실 수" value={metrics.emergencyRoomCount} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              AI 맞춤형 정책 해결책
            </h3>
            <div className="space-y-2">
              {solutions.map((sol, i) => (
                <div
                  key={i}
                  className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-white">{sol.title}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${priorityStyles[sol.priority]}`}
                    >
                      {priorityLabels[sol.priority]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{sol.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-medium">{sol.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
      <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sublabel}</p>
    </div>
  );
}

function FacilityCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 text-center">
      <div className="flex justify-center text-emerald-400 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
