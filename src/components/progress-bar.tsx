interface ProgressBarProps {
  readonly progress: number; // 0–1
  readonly label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const percentage = Math.round(progress * 100);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">{label}</span>
          <span className="text-xs font-mono text-neon-cyan tabular-nums">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
