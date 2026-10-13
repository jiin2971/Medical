import { ChevronLeft, ChevronRight, MapPin, AlertCircle, Heart } from 'lucide-react';
import { useState } from 'react';
import { PERSONAS } from '@/data/mockData';
import { RISK_GRADE_INFO } from '@/types/dashboard';

export function PersonaCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const persona = PERSONAS[index];
  const gradeInfo = RISK_GRADE_INFO[persona.riskGrade];

  const goPrev = () => {
    setDirection('left');
    setIndex((prev) => (prev === 0 ? PERSONAS.length - 1 : prev - 1));
  };

  const goNext = () => {
    setDirection('right');
    setIndex((prev) => (prev === PERSONAS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Heart size={16} className="text-rose-400" />
          시민 페르소나
        </h3>
        <div className="flex items-center gap-1">
          {PERSONAS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 'right' : 'left');
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-rose-500' : 'w-1.5 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex items-center">
        <button
          onClick={goPrev}
          className="absolute left-0 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all hover:scale-110"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          key={persona.id}
          className={`flex-1 mx-10 ${direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
        >
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${persona.gradient} text-2xl shrink-0`}
              >
                {persona.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium" style={{ color: gradeInfo.color }}>{persona.title}</p>
                <h4 className="text-base font-bold text-white truncate">{persona.name}</h4>
                <p className="text-xs text-slate-500">만 {persona.age}세</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
              <MapPin size={12} />
              {persona.location}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {persona.description}
            </p>

            <div className="space-y-2">
              <div>
                <p className="text-[10px] font-semibold text-red-400 mb-1 flex items-center gap-1">
                  <AlertCircle size={10} /> 겪는 어려움
                </p>
                <ul className="space-y-0.5">
                  {persona.challenges.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                  <Heart size={10} /> 필요한 지원
                </p>
                <ul className="space-y-0.5">
                  {persona.needs.slice(0, 3).map((n, i) => (
                    <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={goNext}
          className="absolute right-0 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all hover:scale-110"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
