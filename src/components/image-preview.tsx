import { FiImage, FiFile, FiMaximize } from 'react-icons/fi';
import { formatFileSize } from '../lib/converter';

interface ImagePreviewProps {
  readonly file: File;
  readonly previewUrl: string;
  readonly dimensions: { readonly width: number; readonly height: number } | null;
}

export function ImagePreview({ file, previewUrl, dimensions }: ImagePreviewProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Preview thumbnail */}
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg overflow-hidden checkerboard border border-zinc-800">
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: '160px' }}
        />
      </div>

      {/* File info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <FiFile className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
          <span className="text-xs font-mono text-zinc-300 truncate" title={file.name}>
            {file.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <FiImage className="w-3 h-3" />
            {formatFileSize(file.size)}
          </span>
          {dimensions && (
            <span className="flex items-center gap-1">
              <FiMaximize className="w-3 h-3" />
              {dimensions.width} × {dimensions.height}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] uppercase">
            {file.type.split('/')[1]}
          </span>
        </div>
      </div>
    </div>
  );
}
