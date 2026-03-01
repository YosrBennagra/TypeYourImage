import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import {
  type ConverterCategory,
  getCategoryConfig,
  detectCategoryFromFile,
} from '../lib/constants';

interface DropZoneProps {
  readonly category: ConverterCategory;
  readonly onFileSelected: (file: File) => void;
  readonly onCategorySwitch?: (category: ConverterCategory) => void;
  readonly disabled?: boolean;
}

const CATEGORY_LABELS: Record<ConverterCategory, string> = {
  image: 'image',
  video: 'video',
  audio: 'audio file',
  'video-to-audio': 'video',
  'video-to-animated': 'video',
  subtitle: 'subtitle file',
  data: 'data file',
};

const FORMAT_BADGES: Record<ConverterCategory, readonly string[]> = {
  image: ['PNG', 'JPG', 'WebP', 'GIF', 'TIFF', 'AVIF', 'BMP', 'SVG', 'PSD', 'RAW', '+40 more'],
  video: ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', 'FLV', 'TS', '3GP', '+more'],
  audio: ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'Opus', 'WMA', 'AIFF', 'AMR', '+more'],
  'video-to-audio': ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', 'FLV', '+more'],
  'video-to-animated': ['MP4', 'MOV', 'MKV', 'AVI', 'WebM', 'WMV', '+more'],
  subtitle: ['SRT', 'VTT'],
  data: ['JSON', 'CSV', 'TSV', 'YAML', 'XML'],
};

export function DropZone({ category, onFileSelected, onCategorySwitch, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = getCategoryConfig(category);

  const isValidFile = useCallback(
    (file: File): boolean => {
      if ((config.acceptedTypes as readonly string[]).includes(file.type)) return true;
      return detectCategoryFromFile(file) !== null;
    },
    [config],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const detected = detectCategoryFromFile(file);
      if (detected && detected !== category && !(category === 'video-to-audio' && detected === 'video') && !(category === 'video-to-animated' && detected === 'video') && onCategorySwitch) {
        onCategorySwitch(detected);
      }

      if (file && isValidFile(file)) {
        onFileSelected(file);
      }
    },
    [disabled, isValidFile, onFileSelected, category, onCategorySwitch],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const detected = detectCategoryFromFile(file);
      if (detected && detected !== category && !(category === 'video-to-audio' && detected === 'video') && !(category === 'video-to-animated' && detected === 'video') && onCategorySwitch) {
        onCategorySwitch(detected);
      }

      if (isValidFile(file)) {
        onFileSelected(file);
      }
      e.target.value = '';
    },
    [isValidFile, onFileSelected, category, onCategorySwitch],
  );

  const badges = FORMAT_BADGES[category];

  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      className={`
        drop-zone relative flex flex-col items-center justify-center gap-5
        w-full min-h-[220px] p-8 cursor-pointer
        ${isDragOver ? 'drag-over' : ''}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface border border-white/[0.06] flex items-center justify-center">
        <FiUploadCloud className="w-7 h-7 text-zinc-500" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-base font-medium text-zinc-300">
          Drop your {CATEGORY_LABELS[category]} here
        </p>
        <p className="text-sm text-zinc-600">
          or{' '}
          <span className="text-neon-cyan/80 hover:text-neon-cyan cursor-pointer underline underline-offset-2 decoration-neon-cyan/30">
            browse files
          </span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {badges.map((fmt) => (
          <span
            key={fmt}
            className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-600 bg-surface px-2 py-0.5 rounded-full border border-white/[0.05]"
          >
            {fmt}
          </span>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={config.acceptedExtensions}
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Select ${CATEGORY_LABELS[category]}`}
      />
    </div>
  );
}
