import { useState } from 'react';
import { FiImage, FiFilm, FiMusic, FiHeadphones, FiPlay, FiMessageSquare, FiDatabase, FiChevronDown } from 'react-icons/fi';

const FORMAT_DATA = [
    {
        category: 'Images',
        icon: <FiImage className="w-3.5 h-3.5" />,
        color: 'text-neon-cyan',
        borderColor: 'border-neon-cyan/15',
        inputs: ['PNG', 'JPG', 'WebP', 'GIF', 'SVG', 'BMP', 'TIFF', 'AVIF', 'HEIF', 'JXL', 'PSD', 'RAW', 'ICO', 'TGA', 'EXR', '+more'],
        outputs: ['JPG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WebP', 'AVIF', 'HEIF', 'JXL', 'PDF', 'ICO', 'TGA', 'PPM', 'EXR', '+more'],
    },
    {
        category: 'Video',
        icon: <FiFilm className="w-3.5 h-3.5" />,
        color: 'text-neon-purple',
        borderColor: 'border-neon-purple/15',
        inputs: ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', 'FLV', 'MPEG', '3GP', 'TS', 'VOB', 'MXF', '+more'],
        outputs: ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', 'FLV', 'OGV', '3GP', 'TS', 'VOB', 'MXF', 'GIF'],
    },
    {
        category: 'Audio',
        icon: <FiMusic className="w-3.5 h-3.5" />,
        color: 'text-neon-green',
        borderColor: 'border-neon-green/15',
        inputs: ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'Opus', 'WMA', 'AIFF', 'AMR', 'AC3', 'DTS', 'APE', 'WV', 'MKA', 'MIDI', '+more'],
        outputs: ['MP3', 'AAC', 'M4A', 'OGG', 'Opus', 'WMA', 'AC3', 'MP2', 'AMR', 'WAV', 'FLAC', 'ALAC', 'AIFF'],
    },
    {
        category: 'Video → Audio',
        icon: <FiHeadphones className="w-3.5 h-3.5" />,
        color: 'text-neon-yellow',
        borderColor: 'border-neon-yellow/15',
        inputs: ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', '+more'],
        outputs: ['MP3', 'AAC', 'M4A', 'OGG', 'Opus', 'WMA', 'AC3', 'MP2', 'AMR', 'WAV', 'FLAC', 'ALAC', 'AIFF'],
    },
    {
        category: 'Video → Animated',
        icon: <FiPlay className="w-3.5 h-3.5" />,
        color: 'text-neon-orange',
        borderColor: 'border-neon-orange/15',
        inputs: ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', '+more'],
        outputs: ['GIF', 'APNG', 'Animated WebP', 'Animated AVIF'],
    },
    {
        category: 'Subtitles',
        icon: <FiMessageSquare className="w-3.5 h-3.5" />,
        color: 'text-neon-pink',
        borderColor: 'border-neon-pink/15',
        inputs: ['SRT', 'VTT'],
        outputs: ['SRT', 'VTT'],
    },
    {
        category: 'Data / Text',
        icon: <FiDatabase className="w-3.5 h-3.5" />,
        color: 'text-zinc-400',
        borderColor: 'border-zinc-700/30',
        inputs: ['JSON', 'CSV', 'TSV', 'YAML', 'XML'],
        outputs: ['JSON (Pretty)', 'JSON (Min)', 'CSV', 'TSV', 'YAML', 'XML'],
    },
] as const;

export function SupportedFormats() {
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <section className="w-full">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-5">
                Supported formats
            </h2>
            <div className="space-y-1.5">
                {FORMAT_DATA.map((group, idx) => {
                    const isOpen = expanded === idx;
                    return (
                        <div key={group.category} className={`rounded-xl border ${group.borderColor} bg-surface overflow-hidden`}>
                            <button
                                type="button"
                                onClick={() => setExpanded(isOpen ? null : idx)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                            >
                                <span className={group.color}>{group.icon}</span>
                                <span className={`text-[13px] font-semibold ${group.color} flex-1`}>{group.category}</span>
                                <span className="text-[10px] text-zinc-600 font-mono">{group.inputs.length}→{group.outputs.length}</span>
                                <FiChevronDown className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`transition-all duration-200 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                <div className="px-4 pb-3 flex gap-6">
                                    <div className="flex-1">
                                        <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1.5">Input</p>
                                        <div className="flex flex-wrap gap-1">
                                            {group.inputs.map((fmt) => (
                                                <span key={fmt} className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/[0.05]">
                                                    {fmt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1.5">Output</p>
                                        <div className="flex flex-wrap gap-1">
                                            {group.outputs.map((fmt) => (
                                                <span key={fmt} className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/[0.05]">
                                                    {fmt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
