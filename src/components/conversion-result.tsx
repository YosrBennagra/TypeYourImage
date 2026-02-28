import { FiDownload, FiArrowRight, FiCheckCircle, FiCopy, FiClock } from 'react-icons/fi';
import type { OutputFormat } from '../lib/constants';
import { formatFileSize } from '../lib/converter';

interface ConversionResultProps {
  readonly originalSize: number;
  readonly convertedSize: number;
  readonly format: OutputFormat;
  readonly onDownload: () => void;
  readonly isDownloading: boolean;
  readonly conversionTimeMs?: number;
  readonly onCopyToClipboard?: () => void;
}

export function ConversionResult({
  originalSize,
  convertedSize,
  format,
  onDownload,
  isDownloading,
  conversionTimeMs,
  onCopyToClipboard,
}: ConversionResultProps) {
  const ratio = ((convertedSize / originalSize) * 100).toFixed(1);
  const saved = originalSize - convertedSize;
  const isSmaller = saved > 0;

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Success */}
      <div className="flex items-center gap-2">
        <FiCheckCircle className="w-4 h-4 text-neon-green" />
        <span className="text-sm font-semibold text-neon-green">Conversion complete</span>
        {conversionTimeMs != null && conversionTimeMs > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-500 ml-auto">
            <FiClock className="w-3 h-3" />
            {formatTime(conversionTimeMs)}
          </span>
        )}
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

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm bg-neon-cyan text-zinc-950 hover:bg-neon-cyan/90 disabled:opacity-50 transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Download {format.label}
        </button>

        {onCopyToClipboard && (
          <button
            type="button"
            onClick={onCopyToClipboard}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-200 transition-colors"
            title="Copy to clipboard"
          >
            <FiCopy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
