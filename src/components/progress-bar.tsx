interface ProgressBarProps {
  readonly progress: number;
  readonly label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const percentage = Math.round(progress * 100);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{label}</span>
          <span className="text-xs font-mono text-neon-cyan tabular-nums">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
