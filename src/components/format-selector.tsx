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

  const sourceId = sourceFormat
    ? formats.find((f) => f.mimeType === sourceFormat)?.id
    : undefined;

  // Group formats by their `group` property (if present)
  const hasGroups = formats.some((f) => f.group);

  if (!hasGroups) {
    // Flat grid (video, audio, video-to-audio)
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {formats.map((fmt) => (
          <FormatCard
            key={fmt.id}
            fmt={fmt}
            isSelected={selected?.id === fmt.id}
            isSameAsSource={fmt.id === sourceId}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  // Grouped layout (images)
  const groups: { name: string; items: OutputFormat[] }[] = [];
  const seen = new Set<string>();
  for (const fmt of formats) {
    const name = fmt.group ?? 'Other';
    if (!seen.has(name)) {
      seen.add(name);
      groups.push({ name, items: [] });
    }
    groups.find((g) => g.name === name)!.items.push(fmt);
  }

  return (
    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
      {groups.map((group) => (
        <div key={group.name}>
          <h3 className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-sm py-1 z-10">
            {group.name}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {group.items.map((fmt) => (
              <FormatCard
                key={fmt.id}
                fmt={fmt}
                isSelected={selected?.id === fmt.id}
                isSameAsSource={fmt.id === sourceId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FormatCard({
  fmt,
  isSelected,
  isSameAsSource,
  onSelect,
}: {
  readonly fmt: OutputFormat;
  readonly isSelected: boolean;
  readonly isSameAsSource: boolean;
  readonly onSelect: (format: OutputFormat) => void;
}) {
  return (
    <button
      key={fmt.id}
      type="button"
      onClick={() => onSelect(fmt)}
      className={`format-card relative flex flex-col items-center gap-1.5 p-3 ${isSelected ? 'selected' : ''}`}
      title={fmt.description}
    >
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-cyan flex items-center justify-center">
          <FiCheck className="w-3 h-3 text-zinc-950" strokeWidth={3} />
        </div>
      )}

      <span className={`text-sm font-mono font-bold ${isSelected ? 'text-neon-cyan' : 'text-zinc-300'}`}>
        {fmt.label}
      </span>

      <span className="text-[10px] text-zinc-600 text-center leading-tight">
        {fmt.description}
      </span>

      {isSameAsSource && (
        <span className="text-[9px] text-neon-yellow/70 mt-0.5">same format</span>
      )}
    </button>
  );
}
