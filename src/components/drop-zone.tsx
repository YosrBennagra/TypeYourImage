import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { ACCEPTED_EXTENSIONS, ACCEPTED_TYPES } from '../lib/constants';

interface DropZoneProps {
  readonly onFileSelected: (file: File) => void;
  readonly disabled?: boolean;
}

export function DropZone({ onFileSelected, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFile = useCallback((file: File): boolean => {
    return (ACCEPTED_TYPES as readonly string[]).includes(file.type);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        onFileSelected(file);
      }
    },
    [disabled, isValidFile, onFileSelected],
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
      if (file && isValidFile(file)) {
        onFileSelected(file);
      }
      e.target.value = '';
    },
    [isValidFile, onFileSelected],
  );

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
        relative flex flex-col items-center justify-center gap-4
        w-full h-full min-h-[200px] p-8
        border-2 border-dashed rounded-xl cursor-pointer
        ${isDragOver ? 'dropzone-active' : 'border-zinc-700/40 hover:border-neon-cyan/30 bg-zinc-950/50'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-900 border border-neon-cyan/20">
        <FiUploadCloud className="w-7 h-7 text-neon-cyan" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-lg font-mono font-semibold text-zinc-200">
          Drop your <span className="text-neon-cyan">image</span> here
        </p>
        <p className="text-sm text-zinc-500 leading-relaxed font-mono max-w-sm">
          Supports{' '}
          <span className="text-neon-cyan font-semibold">PNG</span>,{' '}
          <span className="text-neon-cyan font-semibold">JPG</span>,{' '}
          <span className="text-neon-cyan font-semibold">WebP</span>,{' '}
          <span className="text-neon-cyan font-semibold">GIF</span>,{' '}
          <span className="text-neon-cyan font-semibold">SVG</span>,{' '}
          <span className="text-neon-cyan font-semibold">BMP</span>
        </p>
        <p className="text-sm text-zinc-600 font-mono">
          or{' '}
          <span className="text-neon-purple underline underline-offset-2 decoration-neon-purple/40 hover:decoration-neon-purple cursor-pointer">
            browse files
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {['PNG', 'JPG', 'WebP', 'GIF', 'SVG', 'BMP'].map((fmt) => (
          <span
            key={fmt}
            className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800"
          >
            {fmt}
          </span>
        ))}
      </div>

      <p className="text-[10px] text-zinc-600 font-mono">
        100% client-side — your files never leave your browser
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select image file"
      />
    </div>
  );
}
