import { FaGithub, FaHeart } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';
import { FiShield } from 'react-icons/fi';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600">
        {/* Left — Privacy badge */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <FiShield className="w-3 h-3 text-neon-green/60" />
            Files never leave your browser
          </span>
          <span className="hidden sm:inline text-zinc-800">|</span>
          <span className="hidden sm:inline">
            &copy; {currentYear} AllYourTypes &mdash; Open Source
          </span>
        </div>

        {/* Right — Links */}
        <div className="flex items-center gap-0.5">
          <a
            href="https://github.com/YosrBennagra/TypeYourImage"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] hover:text-zinc-400 transition-colors"
            aria-label="GitHub repository"
          >
            <FaGithub className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="https://github.com/sponsors/YosrBennagra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] hover:text-neon-pink transition-colors"
            aria-label="Sponsor on GitHub"
          >
            <FaHeart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sponsor</span>
          </a>
          <a
            href="https://buymeacoffee.com/veinpal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] hover:text-neon-yellow transition-colors"
            aria-label="Buy me a coffee"
          >
            <SiBuymeacoffee className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Coffee</span>
          </a>
          <span className="text-zinc-800 mx-1 hidden sm:inline">|</span>
          <kbd className="hidden sm:inline text-[10px] font-mono text-zinc-700 px-1.5 py-0.5 rounded border border-white/[0.06] bg-white/[0.02]">
            Ctrl+V
          </kbd>
          <span className="hidden sm:inline text-zinc-700 ml-1">to paste</span>
        </div>
      </div>
    </div>
  );
}
