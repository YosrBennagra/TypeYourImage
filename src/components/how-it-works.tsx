import { FiUploadCloud, FiSettings, FiDownload } from 'react-icons/fi';

const STEPS = [
    {
        icon: <FiUploadCloud className="w-5 h-5" />,
        title: 'Drop your file',
        description: 'Drag and drop or browse to upload any image, video, or audio file.',
    },
    {
        icon: <FiSettings className="w-5 h-5" />,
        title: 'Choose format & quality',
        description: 'Select your target format and adjust quality settings to your needs.',
    },
    {
        icon: <FiDownload className="w-5 h-5" />,
        title: 'Download instantly',
        description: 'Your converted file is ready in seconds — download it right away.',
    },
] as const;

export function HowItWorks() {
    return (
        <section className="w-full max-w-2xl mx-auto">
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-6">
                How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STEPS.map((step, i) => (
                    <div
                        key={step.title}
                        className="relative flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                    >
                        <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-[10px] font-bold font-mono text-neon-cyan">
                            {i + 1}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400">
                            {step.icon}
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-200">{step.title}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
