import { FiShield, FiZap, FiLock } from 'react-icons/fi';

const FEATURES = [
  {
    icon: <FiShield className="w-5 h-5 text-neon-green" />,
    title: '100% Private',
    description: 'Files never leave your browser',
  },
  {
    icon: <FiZap className="w-5 h-5 text-neon-cyan" />,
    title: 'Instant Convert',
    description: 'Powered by WebAssembly',
  },
  {
    icon: <FiLock className="w-5 h-5 text-neon-purple" />,
    title: 'No Sign-up',
    description: 'Free, no account needed',
  },
] as const;

export function FeatureCards() {
  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50"
        >
          {f.icon}
          <div>
            <p className="text-xs font-mono font-semibold text-zinc-300">{f.title}</p>
            <p className="text-[10px] font-mono text-zinc-600">{f.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
