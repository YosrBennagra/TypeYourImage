import { FaGithub, FaHeart } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';

export function Footer() {
  return (
    <div className="flex items-center justify-between px-6 h-10 text-[11px] text-zinc-600">
      <span>Files never leave your browser</span>
      <div className="flex items-center gap-1">
        <a
          href="https://github.com/YosrBennagra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:text-zinc-400"
        >
          <FaGithub className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <a
          href="https://github.com/sponsors/YosrBennagra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:text-neon-pink"
        >
          <FaHeart className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sponsor</span>
        </a>
        <a
          href="https://buymeacoffee.com/veinpal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:text-neon-yellow"
        >
          <SiBuymeacoffee className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Coffee</span>
        </a>
      </div>
    </div>
  );
}
