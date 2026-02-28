import { useState, useCallback } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const FAQ_ITEMS = [
    {
        question: 'Is AllYourTypes really free?',
        answer:
            'Yes, completely free with no hidden fees, no ads, and no sign-up required. The tool is open-source and funded by community sponsors.',
    },
    {
        question: 'Are my files uploaded to a server?',
        answer:
            'No. All conversion happens directly in your browser using WebAssembly and the Canvas API. Your files never leave your device, guaranteeing complete privacy.',
    },
    {
        question: 'What file formats are supported?',
        answer:
            'Images: PNG, JPG, WebP, GIF, SVG, BMP. Video: MP4, WebM, AVI, MOV, MKV. Audio: MP3, WAV, OGG, AAC, FLAC, M4A. We are continuously adding more formats.',
    },
    {
        question: 'Is there a file size limit?',
        answer:
            'Images up to 50 MB, audio up to 200 MB, and video up to 500 MB. Since everything runs in your browser, performance depends on your device.',
    },
    {
        question: 'How does video/audio conversion work?',
        answer:
            'Video and audio conversions are powered by FFmpeg compiled to WebAssembly. The engine (~30 MB) is downloaded once and cached by your browser for future use.',
    },
    {
        question: 'Can I use this on mobile?',
        answer:
            'Yes! AllYourTypes works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.',
    },
] as const;

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = useCallback(
        (i: number) => setOpenIndex((prev) => (prev === i ? null : i)),
        [],
    );

    return (
        <section className="w-full max-w-2xl mx-auto">
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-6">
                Frequently asked questions
            </h2>
            <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => {
                    const isOpen = openIndex === i;
                    return (
                        <div
                            key={item.question}
                            className="rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden transition-colors hover:border-white/[0.08]"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                aria-expanded={isOpen}
                            >
                                <span className="text-sm font-medium text-zinc-200">{item.question}</span>
                                <FiChevronDown
                                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
