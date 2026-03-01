import { FiShield, FiZap, FiLock, FiGlobe, FiCpu, FiWifi } from 'react-icons/fi';

const FEATURES = [
  { icon: <FiShield className="w-3.5 h-3.5" />, label: '100% Private' },
  { icon: <FiZap className="w-3.5 h-3.5" />, label: 'WebAssembly' },
  { icon: <FiLock className="w-3.5 h-3.5" />, label: 'No Sign-up' },
  { icon: <FiGlobe className="w-3.5 h-3.5" />, label: 'Cross-platform' },
  { icon: <FiCpu className="w-3.5 h-3.5" />, label: 'Client-side' },
  { icon: <FiWifi className="w-3.5 h-3.5" />, label: 'Offline Ready' },
] as const;

export function FeatureCards() {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {FEATURES.map((f) => (
        <span
          key={f.label}
          className="flex items-center gap-2 px-2 py-1 text-[11px] text-zinc-500"
        >
          <span className="text-zinc-600">{f.icon}</span>
          {f.label}
        </span>
      ))}
    </div>
  );
}