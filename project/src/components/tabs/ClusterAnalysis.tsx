import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, LabelList } from 'recharts';
import { getMetricsForYear } from '@/data/mockData';
import { RISK_GRADE_INFO, RISK_GRADE_ORDER, YEAR_RANGE } from '@/types/dashboard';
import type { RiskGrade, DongMetrics } from '@/types/dashboard';
import { vulnerabilityColor } from '@/utils/colors';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { TimeSlider } from '@/components/map/TimeSlider';

export function ClusterAnalysis() {
  const [year, setYear] = useState<number>(YEAR_RANGE[0]);
  const dongMetrics = getMetricsForYear(year);

  const scatterData = RISK_GRADE_ORDER.map((grade) => {
    const info = RISK_GRADE_INFO[grade];
    return {
      name: info.label,
      color: info.color,
      data: dongMetrics
        .filter((d) => d.riskGrade === grade)
        .map((d) => ({
          x: d.agingRate,
          y: d.twoSfcaScore,
          z: d.vulnerabilityScore,
          name: d.name,
          nameEng: d.nameEng,
          code: d.code,
        })),
    };
  });

  const topVulnerable = [...dongMetrics]
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
    .slice(0, 20);

  const barData = topVulnerable.map((d) => ({
    name: d.name,
    score: d.vulnerabilityScore,
    code: d.code,
  }));

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-thin">
      <div className="flex justify-center">
        <div className="w-72">
          <TimeSlider year={year} onChange={setYear} />
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-red-400" />
          <h3 className="text-base font-bold text-white">위험등급별 2차원 산점도 ({year}년)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          각 점은 행정동을 나타냅니다. X축: 고령인구 비율(%), Y축: 2SFCA 의료접근성 지수.
          점의 크기는 취약성 점수를 반영합니다.
        </p>
        <div style={{ width: '100%', height: 420 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 45, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="x"
                name="고령화율"
                unit="%"
                domain={[0, 55]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                label={{ value: '고령인구 비율 (%)', position: 'bottom', fill: '#94a3b8', fontSize: 12, offset: 15 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="2SFCA 접근성"
                domain={[0, 1]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                label={{ value: '2SFCA 의료접근성 지수', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12, offset: 5 }}
              />
              <ZAxis type="number" dataKey="z" range={[30, 400]} name="취약성" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const p = payload[0].payload as { name: string; nameEng: string; x: number; y: number; z: number };
                  return (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs">
                      <p className="font-bold text-white mb-1">{p.name}</p>
                      <p className="text-slate-400 mb-1">{p.nameEng}</p>
                      <p className="text-orange-400">고령화율: {p.x.toFixed(1)}%</p>
                      <p className="text-sky-400">2SFCA: {p.y.toFixed(3)}</p>
                      <p className="text-red-400">취약성: {p.z}</p>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 10 }}
                formatter={(value: string) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
              />
              {scatterData.map((grade) => (
                <Scatter
                  key={grade.name}
                  name={grade.name}
                  data={grade.data}
                  fill={grade.color}
                  fillOpacity={0.65}
                  stroke={grade.color}
                  strokeWidth={1}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {RISK_GRADE_ORDER.map((grade) => {
            const info = RISK_GRADE_INFO[grade];
            const count = dongMetrics.filter((d) => d.riskGrade === grade).length;
            return (
              <div key={grade} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: info.color }} />
                <span className="text-slate-400">{info.emoji} {info.label}</span>
                <span className="text-slate-600">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-red-400" />
          <h3 className="text-base font-bold text-white">의료취약성 순위 - 상위 20개 행정동 ({year}년)</h3>
        </div>
        <div style={{ width: '100%', height: 480 }}>
          <ResponsiveContainer>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                label={{ value: '취약성 점수', position: 'bottom', fill: '#94a3b8', fontSize: 12, offset: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                stroke="#475569"
                width={90}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const p = payload[0].payload as { name: string; score: number; code: string };
                  const m = dongMetrics.find((d) => d.code === p.code);
                  if (!m) return null;
                  return (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs">
                      <p className="font-bold text-white mb-1">{p.name}</p>
                      <p className="text-red-400">취약성 점수: {p.score}</p>
                      <p className="text-orange-400">고령화율: {m.agingRate.toFixed(1)}%</p>
                      <p className="text-sky-400">2SFCA: {m.twoSfcaScore.toFixed(3)}</p>
                      <p className="text-violet-400">위험등급: {RISK_GRADE_INFO[m.riskGrade].label}</p>
                    </div>
                  );
                }}
                cursor={{ fill: 'rgba(148,163,184,0.1)' }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={vulnerabilityColor(entry.score)} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  style={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
