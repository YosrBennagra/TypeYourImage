import type { OutputFormat } from './constants';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpeg, getFileExtension } from './ffmpeg-loader';

/** Formats that can be produced natively via the HTML Canvas API */
const CANVAS_FORMATS = new Set(['png', 'jpeg', 'webp', 'avif']);

/** Formats handled by custom converters (not FFmpeg) */
const CUSTOM_FORMATS = new Set(['svg', 'pdf']);

/** Check whether a format ID is handled by a custom (non-FFmpeg) converter */
export function isCustomFormat(formatId: string): boolean {
  return CUSTOM_FORMATS.has(formatId);
}

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
 * Uses Canvas for PNG/JPEG/WebP/AVIF when the source loaded as an HTMLImageElement.
 * Uses custom converters for SVG and PDF.
 * Falls back to FFmpeg.wasm for all other formats.
 */
export async function convertImage(
  img: HTMLImageElement | undefined,
  sourceFile: File,
  format: OutputFormat,
  quality: number,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  // Custom converters (SVG, PDF) — need an img element or we render from file
  if (CUSTOM_FORMATS.has(format.id)) {
    const imgEl = img ?? await loadImage(sourceFile);
    if (format.id === 'svg') return convertToSvg(imgEl, sourceFile);
    if (format.id === 'pdf') return convertToPdf(imgEl, sourceFile);
  }

  // Canvas path (PNG, JPEG, WebP, AVIF)
  if (img && isCanvasFormat(format.id)) {
    return convertImageCanvas(img, format, quality);
  }

  // FFmpeg path for all other formats
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
        if (blob && blob.size > 0) {
          resolve(blob);
        } else {
          // AVIF / WebP may not be supported in all browsers
          const hint =
            format.id === 'avif'
              ? ' Your browser may not support AVIF encoding. Try Chrome 116+ or Firefox 113+.'
              : format.id === 'webp'
                ? ' Your browser may not support WebP encoding.'
                : '';
          reject(new Error(`Conversion to ${format.label} failed.${hint}`));
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

/* ─── Custom converters for formats Canvas/FFmpeg can't handle ───── */

/** Render an image element to a PNG data URL via Canvas */
function renderToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, 0, 0);
  return canvas;
}

/** Convert raster image → SVG (embeds the image as base64 inside an SVG wrapper) */
async function convertToSvg(img: HTMLImageElement, _file: File): Promise<Blob> {
  const canvas = renderToCanvas(img);
  const w = canvas.width;
  const h = canvas.height;

  // Get PNG data URL for embedding
  const dataUrl = canvas.toDataURL('image/png');

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `     width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `  <image width="${w}" height="${h}" href="${dataUrl}" />`,
    `</svg>`,
  ].join('\n');

  return new Blob([svg], { type: 'image/svg+xml' });
}

/** Convert raster image → PDF (minimal single-page PDF with embedded JPEG) */
async function convertToPdf(img: HTMLImageElement, _file: File): Promise<Blob> {
  const canvas = renderToCanvas(img);
  const w = canvas.width;
  const h = canvas.height;

  // Get JPEG binary for smaller PDF size
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to render image for PDF'))),
      'image/jpeg',
      0.92,
    );
  });

  const jpegData = new Uint8Array(await jpegBlob.arrayBuffer());

  // Build a minimal valid PDF 1.4
  const encoder = new TextEncoder();
  const parts: (string | Uint8Array)[] = [];
  const offsets: number[] = [];
  let pos = 0;

  const addText = (text: string) => {
    const bytes = encoder.encode(text);
    parts.push(bytes);
    pos += bytes.length;
  };

  const addBinary = (data: Uint8Array) => {
    parts.push(data);
    pos += data.length;
  };

  const recordOffset = () => {
    offsets.push(pos);
  };

  // Header
  addText('%PDF-1.4\n%\xC0\xC1\xC2\xC3\n');

  // Obj 1: Catalog
  recordOffset();
  addText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  recordOffset();
  addText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Obj 3: Page — scale to 72 DPI, max 595x842 (A4ish) while preserving aspect ratio
  const scale = Math.min(595 / w, 842 / h, 1);
  const pw = w * scale;
  const ph = h * scale;
  recordOffset();
  addText(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] ` +
    `/Contents 4 0 R /Resources << /XObject << /Img 5 0 R >> >> >>\nendobj\n`,
  );

  // Obj 4: Content stream (draw image to fill page)
  const stream = `q\n${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm\n/Img Do\nQ\n`;
  recordOffset();
  addText(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);

  // Obj 5: Image XObject (DCTDecode = JPEG)
  recordOffset();
  addText(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
    `/Length ${jpegData.length} >>\nstream\n`,
  );
  addBinary(jpegData);
  addText('\nendstream\nendobj\n');

  // XRef table
  const xrefPos = pos;
  addText(`xref\n0 ${offsets.length + 1}\n`);
  addText('0000000000 65535 f \n');
  for (const offset of offsets) {
    addText(`${String(offset).padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  addText(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  // Assemble
  const totalSize = parts.reduce((s, p) => s + (typeof p === 'string' ? encoder.encode(p).length : p.length), 0);
  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const part of parts) {
    const bytes = part instanceof Uint8Array ? part : encoder.encode(part as string);
    result.set(bytes, offset);
    offset += bytes.length;
  }

  return new Blob([result], { type: 'application/pdf' });
}
