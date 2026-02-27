import { FiCheck } from 'react-icons/fi';
import type { OutputFormat, ConverterCategory } from '../lib/constants';
import { getCategoryConfig } from '../lib/constants';

interface FormatSelectorProps {
  readonly category: ConverterCategory;
  readonly selected: OutputFormat | null;
  readonly onSelect: (format: OutputFormat) => void;
  readonly sourceFormat: string | undefined;
}

export function FormatSelector({ category, selected, onSelect, sourceFormat }: FormatSelectorProps) {
  const config = getCategoryConfig(category);
  const formats = config.outputFormats;

  // Derive source format id from MIME type
  const sourceId = sourceFormat
    ? formats.find((f) => f.mimeType === sourceFormat)?.id
    : undefined;

  // Use responsive grid based on number of formats
  const gridCols = formats.length <= 4 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <div className={`grid ${gridCols} gap-2`}>
      {formats.map((fmt) => {
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
