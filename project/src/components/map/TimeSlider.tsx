import { Calendar } from 'lucide-react';
import { YEARS } from '@/types/dashboard';
import type { AnalysisYear } from '@/types/dashboard';
interface TimeSliderProps {
  year: AnalysisYear;
  onChange: (year: AnalysisYear) => void;
  label?: string;
}
export function TimeSlider({
  year,
  onChange,
  label = '표시 기준 연도',
}: TimeSliderProps) {
  const yearIndex = YEARS.indexOf(year);
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 ">
      {' '}
      <div className="mb-1 flex items-center gap-2">
        {' '}
        <Calendar size={16} className="text-sky-600" />{' '}
        <label
          htmlFor={`year-slider-${label}`}
          className="text-xs font-semibold text-slate-600"
        >
          {label}
        </label>{' '}
        <span className="ml-auto text-sm font-bold text-slate-900">
          {' '}
          {year}년{year === 2031 ? ' 시나리오' : ''}{' '}
        </span>{' '}
      </div>{' '}
      <input
        id={`year-slider-${label}`}
        type="range"
        min={0}
        max={YEARS.length - 1}
        step={1}
        value={yearIndex}
        onChange={(event) => onChange(YEARS[Number(event.target.value)])}
        aria-label={`${label}: ${year}년`}
        className="w-full accent-sky-600"
      />{' '}
      <div className="mt-1 grid grid-cols-4 gap-1">
        {' '}
        {YEARS.map((value) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={value === year}
            className={`rounded-md px-1.5 py-1 text-[11px] transition-colors ${value === year ? 'bg-sky-100 font-bold text-sky-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {' '}
            {value === 2031 ? '2031 시나리오' : value}{' '}
          </button>
        ))}{' '}
      </div>{' '}
    </div>
  );
}
