import { FaGithub, FaHeart } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';
import { FiShield } from 'react-icons/fi';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Inline footer */}
      <div className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <FiShield className="w-3 h-3 text-neon-green/60" />
            Files never leave your browser
          </span>
          <div className="flex items-center gap-3">
            <span>&copy; {currentYear} AllYourTypes</span>
            <span className="text-zinc-800">&middot;</span>
            <span>Open Source</span>
            <span className="hidden sm:flex items-center gap-1.5 text-zinc-700 ml-2">
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/[0.05] bg-white/[0.02]">
                Ctrl+V
              </kbd>
              to paste
            </span>
          </div>
        </div>
      </div>

      {/* Sticky floating support buttons */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-0.5 rounded-2xl bg-surface/95 backdrop-blur-md border border-white/[0.06] shadow-2xl px-1.5 py-1.5">
        <a
          href="https://github.com/YosrBennagra/TypeYourImage"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="GitHub repository"
        >
          <FaGithub className="w-4 h-4" />
        </a>
        <a
          href="https://github.com/sponsors/YosrBennagra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-neon-pink transition-colors"
          aria-label="Sponsor on GitHub"
        >
          <FaHeart className="w-4 h-4" />
        </a>
        <a
          href="https://buymeacoffee.com/veinpal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-neon-yellow transition-colors"
          aria-label="Buy me a coffee"
        >
          <SiBuymeacoffee className="w-4 h-4" />
        </a>
      </div>
    </>
  );
}