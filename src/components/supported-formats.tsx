import { FiImage, FiFilm, FiMusic } from 'react-icons/fi';

const FORMAT_DATA = [
    {
        category: 'Images',
        icon: <FiImage className="w-4 h-4" />,
        color: 'text-neon-cyan',
        borderColor: 'border-neon-cyan/15',
        bgColor: 'bg-neon-cyan/[0.03]',
        inputs: ['PNG', 'JPG', 'WebP', 'GIF', 'SVG', 'BMP'],
        outputs: ['PNG', 'JPG', 'WebP', 'GIF', 'BMP'],
    },
    {
        category: 'Video',
        icon: <FiFilm className="w-4 h-4" />,
        color: 'text-neon-purple',
        borderColor: 'border-neon-purple/15',
        bgColor: 'bg-neon-purple/[0.03]',
        inputs: ['MP4', 'WebM', 'AVI', 'MOV', 'MKV'],
        outputs: ['MP4', 'WebM', 'GIF', 'AVI'],
    },
    {
        category: 'Audio',
        icon: <FiMusic className="w-4 h-4" />,
        color: 'text-neon-green',
        borderColor: 'border-neon-green/15',
        bgColor: 'bg-neon-green/[0.03]',
        inputs: ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A'],
        outputs: ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC'],
    },
] as const;

export function SupportedFormats() {
    return (
        <section className="w-full max-w-2xl mx-auto">
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-6">
                Supported formats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FORMAT_DATA.map((group) => (
                    <div
                        key={group.category}
                        className={`rounded-xl border p-4 space-y-3 ${group.borderColor} ${group.bgColor}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className={group.color}>{group.icon}</span>
                            <h3 className={`text-sm font-semibold ${group.color}`}>{group.category}</h3>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">Input</p>
                            <div className="flex flex-wrap gap-1">
                                {group.inputs.map((fmt) => (
                                    <span
                                        key={fmt}
                                        className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.04]"
                                    >
                                        {fmt}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">Output</p>
                            <div className="flex flex-wrap gap-1">
                                {group.outputs.map((fmt) => (
                                    <span
                                        key={fmt}
                                        className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.04]"
                                    >
                                        {fmt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
