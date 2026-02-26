import { FiCheck } from 'react-icons/fi';
import { OUTPUT_FORMATS, type OutputFormat } from '../lib/constants';

interface FormatSelectorProps {
  readonly selected: OutputFormat | null;
  readonly onSelect: (format: OutputFormat) => void;
  readonly sourceFormat: string | undefined;
}

export function FormatSelector({ selected, onSelect, sourceFormat }: FormatSelectorProps) {
  // Derive source format id from MIME type
  const sourceId = sourceFormat
    ? OUTPUT_FORMATS.find((f) => f.mimeType === sourceFormat)?.id
    : undefined;

  return (
    <div className="grid grid-cols-5 gap-2">
      {OUTPUT_FORMATS.map((fmt) => {
        const isSelected = selected?.id === fmt.id;
        const isSameAsSource = fmt.id === sourceId;

        return (
          <button
            key={fmt.id}
            type="button"
            onClick={() => onSelect(fmt)}
            className={`
              format-card relative flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer
              ${isSelected ? 'selected border-neon-cyan bg-neon-cyan/5' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50'}
            `}
            title={fmt.description}
          >
            {isSelected && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-cyan flex items-center justify-center">
                <FiCheck className="w-3 h-3 text-zinc-950" strokeWidth={3} />
              </div>
            )}

            <span
              className={`text-sm font-mono font-bold ${isSelected ? 'text-neon-cyan' : 'text-zinc-300'}`}
            >
              {fmt.label}
            </span>

            <span className="text-[10px] font-mono text-zinc-500 text-center leading-tight">
              {fmt.description}
            </span>

            {isSameAsSource && (
              <span className="text-[9px] font-mono text-neon-yellow/70 mt-0.5">same format</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
