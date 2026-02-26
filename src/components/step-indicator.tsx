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
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const isActive = step.num === currentStep;
        const isDone = step.num < currentStep;

        return (
          <div key={step.num} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-6 h-px ${isDone ? 'bg-neon-cyan/40' : 'bg-zinc-700'}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono font-bold
                  ${isActive ? 'step-active text-zinc-950' : isDone ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-zinc-800 text-zinc-500'}
                `}
              >
                {step.num}
              </div>
              <span
                className={`text-[11px] font-mono ${isActive ? 'text-zinc-200' : isDone ? 'text-neon-cyan/60' : 'text-zinc-600'}`}
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
