import { useState } from 'react';
import { FiFile, FiImage, FiMaximize, FiFilm, FiMusic, FiFileText } from 'react-icons/fi';
import { formatFileSize } from '../lib/converter';
import type { ConverterCategory } from '../lib/constants';

interface SourcePreviewProps {
  readonly file: File;
  readonly previewUrl: string;
  readonly category: ConverterCategory;
  readonly dimensions?: { readonly width: number; readonly height: number } | null;
}

export function SourcePreview({ file, previewUrl, category, dimensions }: SourcePreviewProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl overflow-hidden bg-surface border border-white/[0.05]">
        {category === 'image' && !imageError && (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '180px' }}
            onError={() => setImageError(true)}
          />
        )}
        {category === 'image' && imageError && (
          <div className="flex flex-col items-center gap-3 p-6 w-full">
            <div className="w-12 h-12 rounded-full bg-neon-cyan/[0.08] border border-neon-cyan/20 flex items-center justify-center">
              <FiImage className="w-5 h-5 text-neon-cyan" />
            </div>
            <p className="text-xs text-zinc-600">Preview not available for this format</p>
          </div>
        )}
        {(category === 'video' || category === 'video-to-audio' || category === 'video-to-animated') && (
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '180px' }}
          >
            <track kind="captions" />
          </video>
        )}
        {category === 'audio' && (
          <div className="flex flex-col items-center gap-4 p-6 w-full">
            <div className="w-12 h-12 rounded-full bg-neon-purple/[0.08] border border-neon-purple/20 flex items-center justify-center">
              <FiMusic className="w-5 h-5 text-neon-purple" />
            </div>
            <audio src={previewUrl} controls className="w-full max-w-[240px]">
              <track kind="captions" />
            </audio>
          </div>
        )}
        {(category === 'subtitle' || category === 'data') && (
          <div className="flex flex-col items-center gap-3 p-6 w-full">
            <div className="w-12 h-12 rounded-full bg-neon-green/[0.08] border border-neon-green/20 flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-neon-green" />
            </div>
            <p className="text-xs text-zinc-600">Text / data file</p>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <FiFile className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-300 truncate" title={file.name}>
            {file.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            {category === 'image' ? (
              <FiImage className="w-3 h-3" />
            ) : category === 'video' || category === 'video-to-audio' || category === 'video-to-animated' ? (
              <FiFilm className="w-3 h-3" />
            ) : category === 'subtitle' || category === 'data' ? (
              <FiFileText className="w-3 h-3" />
            ) : (
              <FiMusic className="w-3 h-3" />
            )}
            <span className="font-mono">{formatFileSize(file.size)}</span>
          </span>
          {dimensions && (
            <span className="flex items-center gap-1">
              <FiMaximize className="w-3 h-3" />
              <span className="font-mono">{dimensions.width} × {dimensions.height}</span>
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-surface text-zinc-500 text-[10px] font-mono uppercase">
            {file.name.split('.').pop()}
          </span>
        </div>
      </div>
    </div>
  );
}
