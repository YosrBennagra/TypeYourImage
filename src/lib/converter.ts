import type { OutputFormat } from './constants';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpeg, getFileExtension } from './ffmpeg-loader';

/** Formats that can be produced natively via the HTML Canvas API */
const CANVAS_FORMATS = new Set(['png', 'jpeg', 'webp']);

/** Check whether a format ID can be handled by the canvas fast-path */
export function isCanvasFormat(formatId: string): boolean {
  return CANVAS_FORMATS.has(formatId);
}

/**
 * Load a File into an HTMLImageElement.
 * For SVG files, reads them as data URLs to allow canvas rendering.
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));

    if (file.type === 'image/svg+xml') {
      // SVG needs to be converted to a data URL for canvas drawing
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsDataURL(file);
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
}

/**
 * Convert an image to the specified output format.
 * Uses Canvas for PNG/JPEG/WebP when the source loaded as an HTMLImageElement.
 * Falls back to FFmpeg.wasm for all other formats.
 */
export async function convertImage(
  img: HTMLImageElement | undefined,
  sourceFile: File,
  format: OutputFormat,
  quality: number,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  if (img && isCanvasFormat(format.id)) {
    return convertImageCanvas(img, format, quality);
  }
  return convertImageFFmpeg(sourceFile, format, quality, onProgress);
}

/**
 * Canvas-based conversion (fast, only for PNG / JPEG / WebP).
 */
function convertImageCanvas(
  img: HTMLImageElement,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // For formats that don't support transparency (JPEG, BMP),
  // fill with a white background first
  if (!format.supportsTransparency) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    const qualityArg = format.supportsQuality ? quality : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Conversion to ${format.label} failed`));
        }
      },
      format.mimeType,
      qualityArg,
    );
  });
}

/**
 * FFmpeg-based image conversion (for TIFF, AVIF, BMP, ICO, TGA, etc.)
 */
async function convertImageFFmpeg(
  file: File,
  format: OutputFormat,
  quality: number,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const ffmpeg = await getFFmpeg();

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.max(0, Math.min(1, progress)));
  };
  ffmpeg.on('progress', progressHandler);

  const inputName = `input${getFileExtension(file.name)}`;
  const outputName = `output${format.extension}`;

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const args = buildImageArgs(inputName, outputName, format, quality);
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName) as Uint8Array;
    if (data.length === 0) {
      throw new Error(`Conversion to ${format.label} produced an empty file. This format may not be supported by the browser engine.`);
    }
    return new Blob([new Uint8Array(data)], { type: format.mimeType });
  } finally {
    try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
    try { await ffmpeg.deleteFile(outputName); } catch { /* ignore */ }
    ffmpeg.off('progress', progressHandler);
  }
}

function buildImageArgs(
  input: string,
  output: string,
  format: OutputFormat,
  quality: number,
): string[] {
  switch (format.id) {
    case 'jpeg':
      // q:v 2–31, lower = better quality
      return ['-i', input, '-q:v', String(Math.round(31 - quality * 29)), '-y', output];
    case 'webp':
      return ['-i', input, '-quality', String(Math.round(quality * 100)), '-y', output];
    case 'avif':
      return ['-i', input, '-c:v', 'libaom-av1', '-crf', String(Math.round(63 - quality * 53)), '-still-picture', '1', '-y', output];
    case 'heif':
      return ['-i', input, '-c:v', 'libx265', '-crf', String(Math.round(51 - quality * 41)), '-y', output];
    case 'jxl':
      return ['-i', input, '-y', output];
    default:
      return ['-i', input, '-y', output];
  }
}

/** Format bytes to human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Extract filename without extension */
export function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

/** Trigger download of a Blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
