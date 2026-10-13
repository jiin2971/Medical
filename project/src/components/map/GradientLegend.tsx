interface LegendProps {
  title: string;
  minLabel: string;
  maxLabel: string;
  gradient: string;
}

export function GradientLegend({ title, minLabel, maxLabel, gradient }: LegendProps) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 shadow-xl">
      <p className="text-xs font-semibold text-slate-300 mb-2">{title}</p>
      <div
        className="h-3 w-full rounded-full mb-1.5"
        style={{ background: gradient }}
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
