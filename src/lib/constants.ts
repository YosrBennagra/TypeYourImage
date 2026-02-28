/* ─────────────────────────────────────────────────────────────
   AllYourTypes — Shared constants and type definitions
   ───────────────────────────────────────────────────────────── */

/** Converter categories */
export type ConverterCategory = 'image' | 'video' | 'audio';

/** Output format definition (shared across categories) */
export interface OutputFormat {
  readonly id: string;
  readonly label: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly supportsQuality: boolean;
  readonly supportsTransparency?: boolean;
  readonly description: string;
}

/** Category configuration */
export interface CategoryConfig {
  readonly id: ConverterCategory;
  readonly label: string;
  readonly description: string;
  readonly acceptedTypes: readonly string[];
  readonly acceptedExtensions: string;
  readonly outputFormats: readonly OutputFormat[];
  readonly maxSizeMB: number;
}

/* ── Image formats ─────────────────────────────────────────── */

export const IMAGE_FORMATS: readonly OutputFormat[] = [
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
    description: 'Uncompressed bitmap',
  },
];

/* ── Video formats ─────────────────────────────────────────── */

export const VIDEO_FORMATS: readonly OutputFormat[] = [
  {
    id: 'mp4',
    label: 'MP4',
    mimeType: 'video/mp4',
    extension: '.mp4',
    supportsQuality: true,
    description: 'Universal compatibility',
  },
  {
    id: 'webm',
    label: 'WebM',
    mimeType: 'video/webm',
    extension: '.webm',
    supportsQuality: true,
    description: 'Open web format, smaller size',
  },
  {
    id: 'video-gif',
    label: 'GIF',
    mimeType: 'image/gif',
    extension: '.gif',
    supportsQuality: false,
    description: 'Animated image from video',
  },
  {
    id: 'avi',
    label: 'AVI',
    mimeType: 'video/x-msvideo',
    extension: '.avi',
    supportsQuality: true,
    description: 'Classic format, wide support',
  },
];

/* ── Audio formats ─────────────────────────────────────────── */

export const AUDIO_FORMATS: readonly OutputFormat[] = [
  {
    id: 'mp3',
    label: 'MP3',
    mimeType: 'audio/mpeg',
    extension: '.mp3',
    supportsQuality: true,
    description: 'Universal audio format',
  },
  {
    id: 'wav',
    label: 'WAV',
    mimeType: 'audio/wav',
    extension: '.wav',
    supportsQuality: false,
    description: 'Lossless, larger files',
  },
  {
    id: 'ogg',
    label: 'OGG',
    mimeType: 'audio/ogg',
    extension: '.ogg',
    supportsQuality: true,
    description: 'Open format, good quality',
  },
  {
    id: 'aac',
    label: 'AAC',
    mimeType: 'audio/aac',
    extension: '.aac',
    supportsQuality: true,
    description: 'High quality, compact',
  },
  {
    id: 'flac',
    label: 'FLAC',
    mimeType: 'audio/flac',
    extension: '.flac',
    supportsQuality: false,
    description: 'Lossless compression',
  },
];

/* ── Category definitions ──────────────────────────────────── */

export const CATEGORIES: readonly CategoryConfig[] = [
  {
    id: 'image',
    label: 'Images',
    description: 'Convert between image formats',
    acceptedTypes: [
      'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp',
    ],
    acceptedExtensions: '.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp',
    outputFormats: IMAGE_FORMATS,
    maxSizeMB: 50,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Convert video formats',
    acceptedTypes: [
      'video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska',
    ],
    acceptedExtensions: '.mp4,.webm,.avi,.mov,.mkv',
    outputFormats: VIDEO_FORMATS,
    maxSizeMB: 500,
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Convert audio formats',
    acceptedTypes: [
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp4', 'audio/x-m4a',
    ],
    acceptedExtensions: '.mp3,.wav,.ogg,.aac,.flac,.m4a',
    outputFormats: AUDIO_FORMATS,
    maxSizeMB: 200,
  },
];

/** Get category config by ID */
export function getCategoryConfig(id: ConverterCategory): CategoryConfig {
  const config = CATEGORIES.find((c) => c.id === id);
  if (!config) throw new Error(`Unknown category: ${id}`);
  return config;
}

/** Detect category from MIME type or file extension */
export function detectCategoryFromFile(file: File): ConverterCategory | null {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  const ext = file.name.toLowerCase().split('.').pop();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(ext ?? '')) return 'image';
  if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext ?? '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext ?? '')) return 'audio';
  return null;
}

/** Status of the conversion flow */
export type AppStatus =
  | 'idle'
  | 'uploading'
  | 'ready'
  | 'loading-engine'
  | 'converting'
  | 'success'
  | 'error';

/** Default quality for lossy formats (0–1) */
export const DEFAULT_QUALITY = 0.85;

/** File size limit warning threshold (bytes) */
export const SIZE_WARNING_THRESHOLD = 100 * 1024 * 1024;
