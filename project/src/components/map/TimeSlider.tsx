import { Calendar } from 'lucide-react';
import { YEAR_RANGE } from '@/types/dashboard';

interface TimeSliderProps {
  year: number;
  onChange: (year: number) => void;
}

export function TimeSlider({ year, onChange }: TimeSliderProps) {
  const min = YEAR_RANGE[0];
  const max = YEAR_RANGE[YEAR_RANGE.length - 1];
  const percent = ((year - min) / (max - min)) * 100;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={16} className="text-sky-400" />
        <span className="text-xs font-semibold text-slate-300">연도별 변화 추이</span>
        <span className="text-sm font-bold text-white ml-auto">{year}년</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={year}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-sky-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-sky-500
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(90deg, #0EA5E9 ${percent}%, #334155 ${percent}%)`,
          }}
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-slate-500">
          {YEAR_RANGE.map((y) => (
            <button
              key={y}
              onClick={() => onChange(y)}
              className={`${y === year ? 'text-sky-400 font-bold' : 'hover:text-slate-400'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
