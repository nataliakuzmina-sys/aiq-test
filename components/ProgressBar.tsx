interface ProgressBarProps {
  /** Номер текущего раунда (1-based). */
  current: number;
  /** Общее число раундов. */
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-muted mb-2">
        <span>
          Раунд {current} из {total}
        </span>
        <span aria-hidden="true">{pct}%</span>
      </div>
      <div
        className="h-2 w-full bg-border rounded-sm overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Раунд ${current} из ${total}`}
      >
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
