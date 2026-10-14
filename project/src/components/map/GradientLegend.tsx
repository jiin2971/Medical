interface LegendProps {
  title: string;
  minLabel: string;
  maxLabel: string;
  gradient: string;
}
export function GradientLegend({
  title,
  minLabel,
  maxLabel,
  gradient,
}: LegendProps) {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 ">
      {' '}
      <p className="text-xs font-semibold text-slate-300 mb-2">{title}</p>{' '}
      <div
        className="h-3 w-full rounded-full mb-1.5"
        style={{ background: gradient }}
      />{' '}
      <div className="flex justify-between text-[10px] text-slate-400">
        {' '}
        <span>{minLabel}</span> <span>{maxLabel}</span>{' '}
      </div>{' '}
    </div>
  );
}
