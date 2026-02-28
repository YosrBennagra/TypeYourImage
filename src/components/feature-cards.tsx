import { FiShield, FiZap, FiLock } from 'react-icons/fi';

const FEATURES = [
  { icon: <FiShield className="w-3.5 h-3.5" />, label: '100% Private' },
  { icon: <FiZap className="w-3.5 h-3.5" />, label: 'Instant' },
  { icon: <FiLock className="w-3.5 h-3.5" />, label: 'No Sign-up' },
] as const;

export function FeatureCards() {
  return (
    <div className="flex items-center justify-center gap-6">
      {FEATURES.map((f) => (
        <div key={f.label} className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="text-zinc-500">{f.icon}</span>
          <span>{f.label}</span>
        </div>
      ))}
    </div>
  );
}
