import { FiFile, FiImage, FiMaximize, FiFilm, FiMusic } from 'react-icons/fi';
import { formatFileSize } from '../lib/converter';
import type { ConverterCategory } from '../lib/constants';

interface SourcePreviewProps {
  readonly file: File;
  readonly previewUrl: string;
  readonly category: ConverterCategory;
  readonly dimensions?: { readonly width: number; readonly height: number } | null;
}

export function SourcePreview({ file, previewUrl, category, dimensions }: SourcePreviewProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg overflow-hidden checkerboard border border-zinc-800">
        {category === 'image' && (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '160px' }}
          />
        )}
        {category === 'video' && (
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '160px' }}
          >
            <track kind="captions" />
          </video>
        )}
        {category === 'audio' && (
          <div className="flex flex-col items-center gap-3 p-4 w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neon-purple/10 border border-neon-purple/30">
              <FiMusic className="w-6 h-6 text-neon-purple" />
            </div>
            <audio src={previewUrl} controls className="w-full max-w-[220px]">
              <track kind="captions" />
            </audio>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <FiFile className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
          <span className="text-xs font-mono text-zinc-300 truncate" title={file.name}>
            {file.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 flex-wrap">
          <span className="flex items-center gap-1">
            {category === 'image' ? (
              <FiImage className="w-3 h-3" />
            ) : category === 'video' ? (
              <FiFilm className="w-3 h-3" />
            ) : (
              <FiMusic className="w-3 h-3" />
            )}
            {formatFileSize(file.size)}
          </span>
          {dimensions && (
            <span className="flex items-center gap-1">
              <FiMaximize className="w-3 h-3" />
              {dimensions.width} × {dimensions.height}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] uppercase">
            {file.name.split('.').pop()}
          </span>
        </div>
      </div>
    </div>
  );
}
