import { FiImage, FiFilm, FiMusic, FiHeadphones, FiPlay, FiMessageSquare, FiDatabase, FiServer } from 'react-icons/fi';
import type { ConverterCategory } from '../lib/constants';
import { CATEGORIES } from '../lib/constants';

interface CategoryTabsProps {
  readonly active: ConverterCategory;
  readonly onChange: (category: ConverterCategory) => void;
  readonly disabled?: boolean;
  readonly showServerPanel?: boolean;
  readonly onServerTabClick?: () => void;
}

const ICONS: Record<ConverterCategory, React.ReactNode> = {
  image: <FiImage className="w-4 h-4" />,
  video: <FiFilm className="w-4 h-4" />,
  audio: <FiMusic className="w-4 h-4" />,
  'video-to-audio': <FiHeadphones className="w-4 h-4" />,
  'video-to-animated': <FiPlay className="w-4 h-4" />,
  subtitle: <FiMessageSquare className="w-4 h-4" />,
  data: <FiDatabase className="w-4 h-4" />,
};

export function CategoryTabs({ active, onChange, disabled = false, showServerPanel, onServerTabClick }: CategoryTabsProps) {
  return (
    <nav className="flex flex-col gap-0.5 w-full">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active && !showServerPanel;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            disabled={disabled}
            className={`
              relative flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left
              ${isActive
                ? 'text-neon-cyan bg-neon-cyan/[0.07]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={cat.description}
          >
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-neon-cyan rounded-full" />
            )}
            {ICONS[cat.id]}
            <span className="truncate">{cat.label}</span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="h-px bg-white/[0.04] my-1.5" />

      {/* Server-side tab */}
      {onServerTabClick && (
        <button
          type="button"
          onClick={onServerTabClick}
          disabled={disabled}
          className={`
            relative flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left
            ${showServerPanel
              ? 'text-neon-purple bg-neon-purple/[0.07]'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title="Server-side processing — coming soon"
        >
          {showServerPanel && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-neon-purple rounded-full" />
          )}
          <FiServer className="w-4 h-4" />
          <span>Server</span>
          <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-neon-purple/15 text-neon-purple leading-none">Soon</span>
        </button>
      )}
    </nav>
  );
}