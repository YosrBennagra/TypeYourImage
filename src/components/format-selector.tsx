import { useState } from 'react';
import { FiCheck, FiSearch } from 'react-icons/fi';
import type { OutputFormat, ConverterCategory } from '../lib/constants';
import { getCategoryConfig } from '../lib/constants';

interface FormatSelectorProps {
  readonly category: ConverterCategory;
  readonly selected: OutputFormat | null;
  readonly onSelect: (format: OutputFormat) => void;
  readonly sourceFormat: string | undefined;
}

export function FormatSelector({ category, selected, onSelect, sourceFormat }: FormatSelectorProps) {
  const [query, setQuery] = useState('');
  const config = getCategoryConfig(category);
  const formats = config.outputFormats;

  const sourceId = sourceFormat
    ? formats.find((f) => f.mimeType === sourceFormat)?.id
    : undefined;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? formats.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        (f.group ?? '').toLowerCase().includes(q),
    )
    : formats;

  const hasGroups = formats.some((f) => f.group);

  // Build groups from filtered results
  const groups: { name: string; items: OutputFormat[] }[] = [];
  if (hasGroups) {
    const seen = new Set<string>();
    for (const fmt of filtered) {
      const name = fmt.group ?? 'Other';
      if (!seen.has(name)) {
        seen.add(name);
        groups.push({ name, items: [] });
      }
      groups.find((g) => g.name === name)!.items.push(fmt);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search bar */}
      <div className="relative shrink-0">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${formats.length} formats…`}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-8 py-2 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/[0.14] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors text-xs leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Format grid */}
      <div className="flex-1 min-h-0 space-y-5">
        {hasGroups
          ? groups.map((group) => (
            <div key={group.name}>
              <p className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 px-0.5">
                {group.name}
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-1.5">
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
          ))
          : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-1.5">
              {filtered.map((fmt) => (
                <FormatCard
                  key={fmt.id}
                  fmt={fmt}
                  isSelected={selected?.id === fmt.id}
                  isSameAsSource={fmt.id === sourceId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}

        {filtered.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-8">No formats match &ldquo;{query}&rdquo;</p>
        )}
      </div>
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
      type="button"
      onClick={() => onSelect(fmt)}
      className={`
        relative w-full text-left px-3 py-2.5 rounded-lg
        border transition-all cursor-pointer group
        ${isSelected
          ? 'bg-neon-cyan/[0.06] border-neon-cyan/20'
          : 'bg-white/[0.015] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        {/* Extension badge */}
        <span
          className={`
            shrink-0 font-mono text-[10px] font-bold px-1.5 py-px rounded tracking-wide
            ${isSelected
              ? 'bg-neon-cyan/10 text-neon-cyan'
              : 'bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/[0.07]'
            }
          `}
        >
          {fmt.extension ?? `.${fmt.id}`}
        </span>

        {/* Label */}
        <span className={`text-[13px] font-medium leading-none truncate ${isSelected ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
          {fmt.label}
        </span>

        {isSameAsSource && (
          <span className="text-[8px] text-neon-yellow/50 font-mono ml-auto shrink-0">SRC</span>
        )}

        {isSelected && (
          <FiCheck className="shrink-0 w-3 h-3 text-neon-cyan ml-auto" />
        )}
      </div>

      <p className={`text-[10px] leading-snug line-clamp-2 ${isSelected ? 'text-zinc-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
        {fmt.description}
      </p>
    </button>
  );
}
