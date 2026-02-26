import { DEFAULT_QUALITY } from '../lib/constants';

interface QualitySliderProps {
  readonly quality: number;
  readonly onChange: (value: number) => void;
}

export function QualitySlider({ quality, onChange }: QualitySliderProps) {
  const percentage = Math.round(quality * 100);
  const isDefault = quality === DEFAULT_QUALITY;

  return (
    <div className="flex items-center gap-4">
      <label className="text-xs font-mono text-zinc-400 whitespace-nowrap" htmlFor="quality-slider">
        Quality
      </label>
      <input
        id="quality-slider"
        type="range"
        min={10}
        max={100}
        value={percentage}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="flex-1"
      />
      <span className="text-xs font-mono text-neon-cyan w-10 text-right tabular-nums">
        {percentage}%
      </span>
      {!isDefault && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_QUALITY)}
          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
        >
          reset
        </button>
      )}
    </div>
  );
}
