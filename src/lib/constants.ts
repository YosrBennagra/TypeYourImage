/** Supported input formats */
export const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
] as const;

export const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp';

/** Output format definitions */
export interface OutputFormat {
  readonly id: string;
  readonly label: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly supportsQuality: boolean;
  readonly supportsTransparency: boolean;
  readonly description: string;
}

export const OUTPUT_FORMATS: readonly OutputFormat[] = [
  {
    id: 'png',
    label: 'PNG',
    mimeType: 'image/png',
    extension: '.png',
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Lossless, supports transparency',
  },
  {
    id: 'jpeg',
    label: 'JPG',
    mimeType: 'image/jpeg',
    extension: '.jpg',
    supportsQuality: true,
    supportsTransparency: false,
    description: 'Lossy compression, smaller files',
  },
  {
    id: 'webp',
    label: 'WebP',
    mimeType: 'image/webp',
    extension: '.webp',
    supportsQuality: true,
    supportsTransparency: true,
    description: 'Modern format, excellent compression',
  },
  {
    id: 'gif',
    label: 'GIF',
    mimeType: 'image/gif',
    extension: '.gif',
    supportsQuality: false,
    supportsTransparency: true,
    description: '256 colors, simple transparency',
  },
  {
    id: 'bmp',
    label: 'BMP',
    mimeType: 'image/bmp',
    extension: '.bmp',
    supportsQuality: false,
    supportsTransparency: false,
    description: 'Uncompressed bitmap, large files',
  },
] as const;

/** Status of the conversion flow */
export type AppStatus = 'idle' | 'uploading' | 'ready' | 'converting' | 'success' | 'error';

/** Default quality for lossy formats (0–1) */
export const DEFAULT_QUALITY = 0.85;
