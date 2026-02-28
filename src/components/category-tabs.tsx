import { FiImage, FiFilm, FiMusic } from 'react-icons/fi';
import type { ConverterCategory } from '../lib/constants';
import { CATEGORIES } from '../lib/constants';

interface CategoryTabsProps {
  readonly active: ConverterCategory;
  readonly onChange: (category: ConverterCategory) => void;
  readonly disabled?: boolean;
}

const ICONS: Record<ConverterCategory, React.ReactNode> = {
  image: <FiImage className="w-4 h-4" />,
  video: <FiFilm className="w-4 h-4" />,
  audio: <FiMusic className="w-4 h-4" />,
};

export function CategoryTabs({ active, onChange, disabled = false }: CategoryTabsProps) {
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? 'bg-white/[0.08] text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.06)]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={cat.description}
          >
            {ICONS[cat.id]}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
