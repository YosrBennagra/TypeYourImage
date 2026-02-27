import { FaGithub, FaHeart } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';
import { FiShield } from 'react-icons/fi';

export function Footer() {
  return (
    <div className="flex items-center justify-between px-5 h-full">
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
        <FiShield className="w-3 h-3 text-neon-green/50" />
        <span>100% client-side • Files never leave your browser</span>
      </div>

      <div className="flex items-center gap-0.5">
        <a
          href="https://github.com/YosrBennagra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          title="GitHub"
        >
          <FaGithub className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <a
          href="https://github.com/sponsors/YosrBennagra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-neon-pink/60 hover:text-neon-pink hover:bg-neon-pink/5"
          title="Sponsor"
        >
          <FaHeart className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sponsor</span>
        </a>
        <a
          href="https://buymeacoffee.com/veinpal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-neon-yellow/60 hover:text-neon-yellow hover:bg-neon-yellow/5"
          title="Buy me a coffee"
        >
          <SiBuymeacoffee className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Coffee</span>
        </a>
      </div>
    </div>
  );
}
