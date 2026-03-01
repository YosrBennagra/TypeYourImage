import { FiUploadCloud, FiSettings, FiDownload } from 'react-icons/fi';

const STEPS = [
    {
        num: '01',
        icon: <FiUploadCloud className="w-5 h-5" />,
        title: 'Drop your file',
        description: 'Drag and drop, click to browse, or paste from clipboard. Any supported format is detected automatically.',
        accent: 'border-neon-cyan/20',
        numColor: 'text-neon-cyan/10',
        iconBg: 'bg-neon-cyan/[0.07] text-neon-cyan border-neon-cyan/15',
    },
    {
        num: '02',
        icon: <FiSettings className="w-5 h-5" />,
        title: 'Choose format & quality',
        description: 'Pick your output format from 200+ options. Adjust quality where it matters — or leave defaults for the best result.',
        accent: 'border-neon-purple/20',
        numColor: 'text-neon-purple/10',
        iconBg: 'bg-neon-purple/[0.07] text-neon-purple border-neon-purple/15',
    },
    {
        num: '03',
        icon: <FiDownload className="w-5 h-5" />,
        title: 'Download instantly',
        description: 'Conversion runs entirely in your browser. No waiting, no server round-trips — your file is ready in seconds.',
        accent: 'border-neon-green/20',
        numColor: 'text-neon-green/10',
        iconBg: 'bg-neon-green/[0.07] text-neon-green border-neon-green/15',
    },
] as const;

export function HowItWorks() {
    return (
        <section className="w-full">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-5">
                How it works
            </h2>

            <div className="space-y-2">
                {STEPS.map((step) => (
                    <div
                        key={step.num}
                        className={`relative overflow-hidden flex items-center gap-5 rounded-xl border ${step.accent} bg-white/[0.01] px-5 py-4 hover:bg-white/[0.025] transition-colors`}
                    >
                        {/* Giant decorative number */}
                        <span
                            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[72px] font-black leading-none select-none pointer-events-none ${step.numColor} font-mono`}
                            aria-hidden="true"
                        >
                            {step.num}
                        </span>

                        {/* Icon */}
                        <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${step.iconBg}`}>
                            {step.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 pr-16">
                            <h3 className="text-sm font-semibold text-zinc-200 mb-0.5">{step.title}</h3>
                            <p className="text-[12px] text-zinc-500 leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

