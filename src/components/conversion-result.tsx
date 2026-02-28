import { FiDownload, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import type { OutputFormat } from '../lib/constants';
import { formatFileSize } from '../lib/converter';

interface ConversionResultProps {
  readonly originalSize: number;
  readonly convertedSize: number;
  readonly format: OutputFormat;
  readonly onDownload: () => void;
  readonly isDownloading: boolean;
}

export function ConversionResult({
  originalSize,
  convertedSize,
  format,
  onDownload,
  isDownloading,
}: ConversionResultProps) {
  const ratio = ((convertedSize / originalSize) * 100).toFixed(1);
  const saved = originalSize - convertedSize;
  const isSmaller = saved > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Success */}
      <div className="flex items-center gap-2">
        <FiCheckCircle className="w-4 h-4 text-neon-green" />
        <span className="text-sm font-semibold text-neon-green">Conversion complete</span>
      </div>

      {/* Size comparison */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-zinc-400 font-mono">{formatFileSize(originalSize)}</span>
        <FiArrowRight className="w-3 h-3 text-zinc-600" />
        <span className="text-neon-cyan font-mono">{formatFileSize(convertedSize)}</span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSmaller ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-yellow/10 text-neon-yellow'
            }`}
        >
          {ratio}%{isSmaller ? ` (−${formatFileSize(saved)})` : ''}
        </span>
      </div>

      {/* Download */}
      <button
        type="button"
        onClick={onDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm bg-neon-cyan text-zinc-950 hover:bg-neon-cyan/90 disabled:opacity-50 transition-colors"
      >
        <FiDownload className="w-4 h-4" />
        Download {format.label}
      </button>
    </div>
  );
}
