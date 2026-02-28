import { FiShield, FiZap, FiLock, FiGlobe, FiCpu, FiWifi } from 'react-icons/fi';

const FEATURES = [
  {
    icon: <FiShield className="w-4 h-4" />,
    label: '100% Private',
    description: 'Files never leave your device',
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/[0.06]',
    borderColor: 'border-neon-green/15',
  },
  {
    icon: <FiZap className="w-4 h-4" />,
    label: 'Instant',
    description: 'Powered by WebAssembly',
    color: 'text-neon-cyan',
    bgColor: 'bg-neon-cyan/[0.06]',
    borderColor: 'border-neon-cyan/15',
  },
  {
    icon: <FiLock className="w-4 h-4" />,
    label: 'No Sign-up',
    description: 'Just drop and convert',
    color: 'text-neon-purple',
    bgColor: 'bg-neon-purple/[0.06]',
    borderColor: 'border-neon-purple/15',
  },
  {
    icon: <FiGlobe className="w-4 h-4" />,
    label: 'Cross-platform',
    description: 'Works on any browser',
    color: 'text-neon-pink',
    bgColor: 'bg-neon-pink/[0.06]',
    borderColor: 'border-neon-pink/15',
  },
  {
    icon: <FiCpu className="w-4 h-4" />,
    label: 'Client-side',
    description: 'Zero server processing',
    color: 'text-neon-yellow',
    bgColor: 'bg-neon-yellow/[0.06]',
    borderColor: 'border-neon-yellow/15',
  },
  {
    icon: <FiWifi className="w-4 h-4" />,
    label: 'Works offline',
    description: 'After first engine load',
    color: 'text-neon-cyan',
    bgColor: 'bg-neon-cyan/[0.06]',
    borderColor: 'border-neon-cyan/15',
  },
] as const;

export function FeatureCards() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
      {FEATURES.map((f) => (
        <div
          key={f.label}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${f.borderColor} ${f.bgColor} transition-colors hover:border-opacity-40`}
        >
          <span className={f.color}>{f.icon}</span>
          <span className="text-[11px] font-medium text-zinc-300 text-center leading-tight">
            {f.label}
          </span>
          <span className="text-[9px] text-zinc-600 text-center leading-tight hidden sm:block">
            {f.description}
          </span>
        </div>
      ))}
    </div>
  );
}
