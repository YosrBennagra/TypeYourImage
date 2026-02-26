import type { OutputFormat } from './constants';

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
 * Convert an image element to the specified output format using canvas.
 * Returns the resulting Blob.
 */
export async function convertImage(
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
