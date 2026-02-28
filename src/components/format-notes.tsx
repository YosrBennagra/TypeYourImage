import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import type { OutputFormat, ConverterCategory } from '../lib/constants';

interface TransparencyNoticeProps {
  readonly sourceHasAlpha: boolean;
  readonly targetFormat: OutputFormat;
}

export function TransparencyNotice({ sourceHasAlpha, targetFormat }: TransparencyNoticeProps) {
  if (!sourceHasAlpha || targetFormat.supportsTransparency) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neon-yellow/[0.04] border border-neon-yellow/15">
      <FiAlertTriangle className="w-3.5 h-3.5 text-neon-yellow shrink-0 mt-0.5" />
      <p className="text-xs text-neon-yellow/70 leading-relaxed">
        {targetFormat.label} does not support transparency. Transparent areas will use a white
        background.
      </p>
    </div>
  );
}

interface FormatNotesProps {
  readonly format: OutputFormat;
  readonly category: ConverterCategory;
}

export function FormatNotes({ format, category }: FormatNotesProps) {
  const notes: string[] = [];

  if (category === 'image') {
    if (format.id === 'gif')
      notes.push('GIF is limited to 256 colors. Complex images may lose quality.');
    if (format.id === 'bmp') notes.push('BMP files are uncompressed and can be very large.');
    if (format.id === 'webp')
      notes.push('WebP offers 25-35% better compression than JPEG at similar quality.');
  }

  if (category === 'video') {
    if (format.id === 'video-gif')
      notes.push('Video will be resized to 480px width at 12 fps.');
    if (format.id === 'webm')
      notes.push('WebM uses VP8 — great for web with smaller file sizes.');
    if (format.id === 'mp4')
      notes.push('MP4 with H.264 — the most widely compatible format.');
  }

  if (category === 'audio') {
    if (format.id === 'wav')
      notes.push('WAV is uncompressed — output will be significantly larger.');
    if (format.id === 'flac')
      notes.push('FLAC provides lossless compression at ~50% of WAV size.');
    if (format.id === 'ogg')
      notes.push('OGG Vorbis is open-source with quality comparable to MP3.');
  }

  if (notes.length === 0) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <FiInfo className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
      <p className="text-xs text-zinc-500 leading-relaxed">{notes.join(' ')}</p>
    </div>
  );
}
