interface StepIndicatorProps {
  readonly currentStep: number;
}

const STEPS = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'Configure' },
  { num: 3, label: 'Download' },
] as const;

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
        const isActive = step.num === currentStep;
        const isDone = step.num < currentStep;

        return (
          <div key={step.num} className="flex items-center gap-3">
            {i > 0 && (
              <div className={`w-8 h-px ${isDone ? 'bg-neon-cyan/30' : 'bg-white/[0.06]'}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold
                  ${isActive
                    ? 'bg-neon-cyan text-[#0a0a0a]'
                    : isDone
                      ? 'bg-neon-cyan/15 text-neon-cyan'
                      : 'bg-white/[0.04] text-zinc-600'}
                `}
              >
                {step.num}
              </div>
              <span
                className={`text-xs ${isActive ? 'text-zinc-200' : isDone ? 'text-neon-cyan/50' : 'text-zinc-600'}`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
