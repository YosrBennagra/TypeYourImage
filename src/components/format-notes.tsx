import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import type { OutputFormat } from '../lib/constants';

interface TransparencyNoticeProps {
  readonly sourceHasAlpha: boolean;
  readonly targetFormat: OutputFormat;
}

export function TransparencyNotice({ sourceHasAlpha, targetFormat }: TransparencyNoticeProps) {
  if (!sourceHasAlpha || targetFormat.supportsTransparency) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neon-yellow/5 border border-neon-yellow/20">
      <FiAlertTriangle className="w-3.5 h-3.5 text-neon-yellow shrink-0 mt-0.5" />
      <p className="text-[11px] font-mono text-neon-yellow/80 leading-relaxed">
        {targetFormat.label} does not support transparency. Transparent areas will be filled with a
        white background.
      </p>
    </div>
  );
}

interface FormatNotesProps {
  readonly format: OutputFormat;
}

export function FormatNotes({ format }: FormatNotesProps) {
  const notes: string[] = [];

  if (format.id === 'gif') {
    notes.push('GIF is limited to 256 colors. Complex images may lose quality.');
  }
  if (format.id === 'bmp') {
    notes.push('BMP files are uncompressed and can be very large.');
  }
  if (format.id === 'webp') {
    notes.push('WebP offers 25-35% better compression than JPEG at similar quality.');
  }

  if (notes.length === 0) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
      <FiInfo className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
      <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">{notes.join(' ')}</p>
    </div>
  );
}
