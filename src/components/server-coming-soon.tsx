import { FiServer, FiCpu, FiLayers, FiPackage, FiTool, FiZap } from 'react-icons/fi';

const PLANNED_FEATURES = [
    {
        icon: <FiLayers className="w-4 h-4" />,
        title: 'Document Conversion',
        items: ['DOCX / PPTX / XLSX → PDF', 'PDF → Images', 'Markdown / HTML → PDF'],
    },
    {
        icon: <FiPackage className="w-4 h-4" />,
        title: 'Batch Processing',
        items: ['Convert multiple files at once', 'ZIP download of results', 'Queue-based job processing'],
    },
    {
        icon: <FiCpu className="w-4 h-4" />,
        title: 'Heavy Lifting',
        items: ['Large video files (no browser limits)', 'Server-side FFmpeg + LibreOffice', 'Faster processing with dedicated CPU'],
    },
    {
        icon: <FiTool className="w-4 h-4" />,
        title: 'Advanced Tools',
        items: ['Video trim / cut / merge', 'Audio normalization (podcast mode)', 'Compress & optimize for web'],
    },
    {
        icon: <FiZap className="w-4 h-4" />,
        title: 'Developer API',
        items: ['REST API with key-based auth', 'Webhook callbacks on completion', 'Signed URL uploads / downloads'],
    },
] as const;

export function ServerComingSoon() {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header — left-aligned */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-purple/[0.08] border border-neon-purple/20">
                        <FiServer className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-zinc-100">
                            Server-Side Processing
                        </h2>
                        <span className="text-[10px] font-semibold text-neon-purple tracking-wider uppercase">Coming Soon</span>
                    </div>
                </div>
                <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
                    All current conversions run 100% in your browser. We're building a server-side engine
                    for heavy jobs, large files, and advanced formats.
                </p>
            </div>

            {/* Feature grid — 2-col */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANNED_FEATURES.map((feature) => (
                    <div
                        key={feature.title}
                        className="rounded-xl border border-white/[0.06] bg-surface p-4 space-y-2.5 hover:border-neon-purple/15 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-neon-purple">
                            {feature.icon}
                            <h3 className="text-sm font-semibold">{feature.title}</h3>
                        </div>
                        <ul className="space-y-1">
                            {feature.items.map((item) => (
                                <li key={item} className="text-xs text-zinc-500 flex items-start gap-1.5">
                                    <span className="text-neon-purple/40 mt-0.5">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Architecture note */}
            <div className="w-full rounded-xl border border-white/[0.06] bg-surface p-5 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-300">Hybrid Architecture</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    The plan is a <span className="text-zinc-400">hybrid approach</span>: small files convert locally in your browser (fast, private, free).
                    Large or complex jobs route to a secure server with sandboxed workers, job queues, and time/size limits.
                    You always control where your files are processed.
                </p>
            </div>

            {/* CTA */}
            <p className="text-xs text-zinc-600">
                Want early access?{' '}
                <a
                    href="https://github.com/veinpal/AllYourTypes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-purple hover:text-neon-purple/80 transition-colors"
                >
                    Open an issue on GitHub
                </a>
            </p>
        </div>
    );
}
