import { FiImage, FiFilm, FiMusic } from 'react-icons/fi';
import type { ConverterCategory } from '../lib/constants';
import { CATEGORIES } from '../lib/constants';

interface CategoryTabsProps {
  readonly active: ConverterCategory;
  readonly onChange: (category: ConverterCategory) => void;
  readonly disabled?: boolean;
}

const CATEGORY_ICONS: Record<ConverterCategory, React.ReactNode> = {
  image: <FiImage className="w-4 h-4" />,
  video: <FiFilm className="w-4 h-4" />,
  audio: <FiMusic className="w-4 h-4" />,
};

export function CategoryTabs({ active, onChange, disabled = false }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={cat.description}
          >
            {CATEGORY_ICONS[cat.id]}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
