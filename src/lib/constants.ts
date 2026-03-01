/* ─────────────────────────────────────────────────────────────
   AllYourTypes — Shared constants and type definitions
   ───────────────────────────────────────────────────────────── */

/** Converter categories */
export type ConverterCategory = 'image' | 'video' | 'audio' | 'video-to-audio' | 'video-to-animated' | 'subtitle' | 'data';

/** Output format definition (shared across categories) */
export interface OutputFormat {
  readonly id: string;
  readonly label: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly supportsQuality: boolean;
  readonly supportsTransparency?: boolean;
  readonly description: string;
  readonly group?: string;
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
  // ── Common Raster ──────────────────────────────────────────
  { id: 'jpeg', label: 'JPG', mimeType: 'image/jpeg', extension: '.jpg', supportsQuality: true, supportsTransparency: false, description: 'Lossy compression, smaller files', group: 'Common Raster' },
  { id: 'png', label: 'PNG', mimeType: 'image/png', extension: '.png', supportsQuality: false, supportsTransparency: true, description: 'Lossless, supports transparency', group: 'Common Raster' },
  { id: 'gif', label: 'GIF', mimeType: 'image/gif', extension: '.gif', supportsQuality: false, supportsTransparency: true, description: '256 colors, simple transparency', group: 'Common Raster' },
  { id: 'bmp', label: 'BMP', mimeType: 'image/bmp', extension: '.bmp', supportsQuality: false, supportsTransparency: false, description: 'Uncompressed bitmap', group: 'Common Raster' },
  { id: 'tiff', label: 'TIFF', mimeType: 'image/tiff', extension: '.tiff', supportsQuality: false, supportsTransparency: true, description: 'Lossless, professional use', group: 'Common Raster' },
  { id: 'webp', label: 'WebP', mimeType: 'image/webp', extension: '.webp', supportsQuality: true, supportsTransparency: true, description: 'Modern, excellent compression', group: 'Common Raster' },
  { id: 'avif', label: 'AVIF', mimeType: 'image/avif', extension: '.avif', supportsQuality: true, supportsTransparency: true, description: 'Next-gen, superior compression', group: 'Common Raster' },
  { id: 'heif', label: 'HEIF', mimeType: 'image/heif', extension: '.heif', supportsQuality: true, supportsTransparency: false, description: 'Apple / HEVC based', group: 'Common Raster' },
  { id: 'jxl', label: 'JPEG XL', mimeType: 'image/jxl', extension: '.jxl', supportsQuality: true, supportsTransparency: true, description: 'Next-gen JPEG replacement', group: 'Common Raster' },

  // ── Vector / Document ──────────────────────────────────────
  { id: 'svg', label: 'SVG', mimeType: 'image/svg+xml', extension: '.svg', supportsQuality: false, supportsTransparency: true, description: 'Scalable vector graphics', group: 'Vector' },
  { id: 'eps', label: 'EPS', mimeType: 'application/postscript', extension: '.eps', supportsQuality: false, supportsTransparency: false, description: 'Encapsulated PostScript', group: 'Vector' },
  { id: 'pdf', label: 'PDF', mimeType: 'application/pdf', extension: '.pdf', supportsQuality: false, supportsTransparency: false, description: 'Portable Document Format', group: 'Vector' },
  { id: 'ai', label: 'AI', mimeType: 'application/illustrator', extension: '.ai', supportsQuality: false, supportsTransparency: false, description: 'Adobe Illustrator', group: 'Vector' },
  { id: 'cdr', label: 'CDR', mimeType: 'application/cdr', extension: '.cdr', supportsQuality: false, supportsTransparency: false, description: 'CorelDRAW', group: 'Vector' },
  { id: 'wmf', label: 'WMF', mimeType: 'image/wmf', extension: '.wmf', supportsQuality: false, supportsTransparency: false, description: 'Windows Metafile', group: 'Vector' },
  { id: 'emf', label: 'EMF', mimeType: 'image/emf', extension: '.emf', supportsQuality: false, supportsTransparency: false, description: 'Enhanced Metafile', group: 'Vector' },

  // ── Camera RAW ─────────────────────────────────────────────
  { id: 'dng', label: 'DNG', mimeType: 'image/x-adobe-dng', extension: '.dng', supportsQuality: false, supportsTransparency: false, description: 'Adobe Digital Negative', group: 'Camera RAW' },
  { id: 'cr2', label: 'CR2', mimeType: 'image/x-canon-cr2', extension: '.cr2', supportsQuality: false, supportsTransparency: false, description: 'Canon RAW', group: 'Camera RAW' },
  { id: 'cr3', label: 'CR3', mimeType: 'image/x-canon-cr3', extension: '.cr3', supportsQuality: false, supportsTransparency: false, description: 'Canon RAW v3', group: 'Camera RAW' },
  { id: 'nef', label: 'NEF', mimeType: 'image/x-nikon-nef', extension: '.nef', supportsQuality: false, supportsTransparency: false, description: 'Nikon RAW', group: 'Camera RAW' },
  { id: 'arw', label: 'ARW', mimeType: 'image/x-sony-arw', extension: '.arw', supportsQuality: false, supportsTransparency: false, description: 'Sony RAW', group: 'Camera RAW' },
  { id: 'raf', label: 'RAF', mimeType: 'image/x-fuji-raf', extension: '.raf', supportsQuality: false, supportsTransparency: false, description: 'Fujifilm RAW', group: 'Camera RAW' },
  { id: 'orf', label: 'ORF', mimeType: 'image/x-olympus-orf', extension: '.orf', supportsQuality: false, supportsTransparency: false, description: 'Olympus RAW', group: 'Camera RAW' },
  { id: 'rw2', label: 'RW2', mimeType: 'image/x-panasonic-rw2', extension: '.rw2', supportsQuality: false, supportsTransparency: false, description: 'Panasonic RAW', group: 'Camera RAW' },
  { id: 'pef', label: 'PEF', mimeType: 'image/x-pentax-pef', extension: '.pef', supportsQuality: false, supportsTransparency: false, description: 'Pentax RAW', group: 'Camera RAW' },
  { id: 'srw', label: 'SRW', mimeType: 'image/x-samsung-srw', extension: '.srw', supportsQuality: false, supportsTransparency: false, description: 'Samsung RAW', group: 'Camera RAW' },

  // ── Layered / Editing Project ──────────────────────────────
  { id: 'psd', label: 'PSD', mimeType: 'image/vnd.adobe.photoshop', extension: '.psd', supportsQuality: false, supportsTransparency: true, description: 'Photoshop Document', group: 'Layered' },
  { id: 'psb', label: 'PSB', mimeType: 'image/vnd.adobe.photoshop', extension: '.psb', supportsQuality: false, supportsTransparency: true, description: 'Photoshop Big', group: 'Layered' },
  { id: 'xcf', label: 'XCF', mimeType: 'image/x-xcf', extension: '.xcf', supportsQuality: false, supportsTransparency: true, description: 'GIMP project', group: 'Layered' },
  { id: 'kra', label: 'KRA', mimeType: 'application/x-krita', extension: '.kra', supportsQuality: false, supportsTransparency: true, description: 'Krita project', group: 'Layered' },
  { id: 'afphoto', label: 'AFPHOTO', mimeType: 'application/x-affinity-photo', extension: '.afphoto', supportsQuality: false, supportsTransparency: true, description: 'Affinity Photo', group: 'Layered' },

  // ── Icons / Cursors ────────────────────────────────────────
  { id: 'ico', label: 'ICO', mimeType: 'image/x-icon', extension: '.ico', supportsQuality: false, supportsTransparency: true, description: 'Windows icon', group: 'Icons' },
  { id: 'icns', label: 'ICNS', mimeType: 'image/x-icns', extension: '.icns', supportsQuality: false, supportsTransparency: true, description: 'macOS icon', group: 'Icons' },
  { id: 'cur', label: 'CUR', mimeType: 'image/x-win-bitmap', extension: '.cur', supportsQuality: false, supportsTransparency: true, description: 'Windows cursor', group: 'Icons' },
  { id: 'ani', label: 'ANI', mimeType: 'application/x-navi-animation', extension: '.ani', supportsQuality: false, supportsTransparency: true, description: 'Animated cursor', group: 'Icons' },

  // ── Legacy / Less Common ───────────────────────────────────
  { id: 'tga', label: 'TGA', mimeType: 'image/x-tga', extension: '.tga', supportsQuality: false, supportsTransparency: true, description: 'Targa format', group: 'Legacy' },
  { id: 'pcx', label: 'PCX', mimeType: 'image/x-pcx', extension: '.pcx', supportsQuality: false, supportsTransparency: false, description: 'PC Paintbrush', group: 'Legacy' },
  { id: 'ppm', label: 'PPM', mimeType: 'image/x-portable-pixmap', extension: '.ppm', supportsQuality: false, supportsTransparency: false, description: 'Portable Pixmap', group: 'Legacy' },
  { id: 'pgm', label: 'PGM', mimeType: 'image/x-portable-graymap', extension: '.pgm', supportsQuality: false, supportsTransparency: false, description: 'Portable Graymap', group: 'Legacy' },
  { id: 'pbm', label: 'PBM', mimeType: 'image/x-portable-bitmap', extension: '.pbm', supportsQuality: false, supportsTransparency: false, description: 'Portable Bitmap', group: 'Legacy' },
  { id: 'pnm', label: 'PNM', mimeType: 'image/x-portable-anymap', extension: '.pnm', supportsQuality: false, supportsTransparency: false, description: 'Portable Anymap', group: 'Legacy' },
  { id: 'iff', label: 'IFF', mimeType: 'image/x-ilbm', extension: '.iff', supportsQuality: false, supportsTransparency: false, description: 'Amiga ILBM', group: 'Legacy' },
  { id: 'dds', label: 'DDS', mimeType: 'image/vnd-ms.dds', extension: '.dds', supportsQuality: false, supportsTransparency: true, description: 'DirectDraw Surface', group: 'Legacy' },

  // ── Scientific / Medical / Pro ─────────────────────────────
  { id: 'dcm', label: 'DICOM', mimeType: 'application/dicom', extension: '.dcm', supportsQuality: false, supportsTransparency: false, description: 'Medical imaging', group: 'Scientific' },
  { id: 'fits', label: 'FITS', mimeType: 'image/fits', extension: '.fits', supportsQuality: false, supportsTransparency: false, description: 'Astronomy format', group: 'Scientific' },
  { id: 'exr', label: 'EXR', mimeType: 'image/x-exr', extension: '.exr', supportsQuality: false, supportsTransparency: true, description: 'HDR / VFX format', group: 'Scientific' },
  { id: 'hdr', label: 'HDR', mimeType: 'image/vnd.radiance', extension: '.hdr', supportsQuality: false, supportsTransparency: false, description: 'Radiance HDR', group: 'Scientific' },
  { id: 'pfm-img', label: 'PFM', mimeType: 'image/x-pfm', extension: '.pfm', supportsQuality: false, supportsTransparency: false, description: 'Portable Float Map', group: 'Scientific' },
];

/* ── Video formats ─────────────────────────────────────────── */

export const VIDEO_FORMATS: readonly OutputFormat[] = [
  // ── Common containers ──────────────────────────────────────
  { id: 'mp4', label: 'MP4', mimeType: 'video/mp4', extension: '.mp4', supportsQuality: true, description: 'Universal compatibility', group: 'Common' },
  { id: 'webm', label: 'WebM', mimeType: 'video/webm', extension: '.webm', supportsQuality: true, description: 'Open web format, smaller size', group: 'Common' },
  { id: 'mov', label: 'MOV', mimeType: 'video/quicktime', extension: '.mov', supportsQuality: true, description: 'Apple QuickTime', group: 'Common' },
  { id: 'mkv', label: 'MKV', mimeType: 'video/x-matroska', extension: '.mkv', supportsQuality: true, description: 'Matroska, flexible container', group: 'Common' },
  { id: 'avi', label: 'AVI', mimeType: 'video/x-msvideo', extension: '.avi', supportsQuality: true, description: 'Classic format, wide support', group: 'Common' },
  { id: 'mpeg', label: 'MPEG', mimeType: 'video/mpeg', extension: '.mpg', supportsQuality: true, description: 'MPEG-1/2 standard video', group: 'Common' },
  { id: 'm4v', label: 'M4V', mimeType: 'video/x-m4v', extension: '.m4v', supportsQuality: true, description: 'Apple MPEG-4 variant', group: 'Common' },
  { id: 'wmv', label: 'WMV', mimeType: 'video/x-ms-wmv', extension: '.wmv', supportsQuality: true, description: 'Windows Media Video', group: 'Common' },
  { id: 'flv', label: 'FLV', mimeType: 'video/x-flv', extension: '.flv', supportsQuality: true, description: 'Flash Video (legacy)', group: 'Common' },
  { id: 'ogv', label: 'OGV', mimeType: 'video/ogg', extension: '.ogv', supportsQuality: true, description: 'Ogg Theora video', group: 'Common' },
  { id: '3gp', label: '3GP', mimeType: 'video/3gpp', extension: '.3gp', supportsQuality: true, description: 'Mobile / 3G video', group: 'Common' },
  // ── Broadcast / transport / disc ───────────────────────────
  { id: 'ts', label: 'TS', mimeType: 'video/mp2t', extension: '.ts', supportsQuality: true, description: 'MPEG transport stream', group: 'Broadcast' },
  { id: 'vob', label: 'VOB', mimeType: 'video/dvd', extension: '.vob', supportsQuality: true, description: 'DVD Video Object', group: 'Broadcast' },
  // ── Professional / production ──────────────────────────────
  { id: 'mxf', label: 'MXF', mimeType: 'application/mxf', extension: '.mxf', supportsQuality: true, description: 'Material Exchange Format', group: 'Professional' },
  // ── Animated image from video ──────────────────────────────
  { id: 'video-gif', label: 'GIF', mimeType: 'image/gif', extension: '.gif', supportsQuality: false, description: 'Animated GIF from video', group: 'Animated' },
];

/* ── Video-to-Animated-Image formats ───────────────────────── */

export const VIDEO_TO_ANIMATED_FORMATS: readonly OutputFormat[] = [
  { id: 'anim-gif', label: 'GIF', mimeType: 'image/gif', extension: '.gif', supportsQuality: false, description: 'Animated GIF, 256 colors' },
  { id: 'anim-apng', label: 'APNG', mimeType: 'image/apng', extension: '.apng', supportsQuality: false, description: 'Animated PNG, full color' },
  { id: 'anim-webp', label: 'Animated WebP', mimeType: 'image/webp', extension: '.webp', supportsQuality: true, description: 'Animated WebP, good compression' },
  { id: 'anim-avif', label: 'Animated AVIF', mimeType: 'image/avif', extension: '.avif', supportsQuality: true, description: 'Animated AVIF, next-gen' },
];

/* ── Audio formats ─────────────────────────────────────────── */

export const AUDIO_FORMATS: readonly OutputFormat[] = [
  // ── Common Lossy ───────────────────────────────────────────
  { id: 'mp3', label: 'MP3', mimeType: 'audio/mpeg', extension: '.mp3', supportsQuality: true, description: 'Universal audio format', group: 'Common Lossy' },
  { id: 'aac', label: 'AAC', mimeType: 'audio/aac', extension: '.aac', supportsQuality: true, description: 'High quality, compact', group: 'Common Lossy' },
  { id: 'm4a', label: 'M4A', mimeType: 'audio/mp4', extension: '.m4a', supportsQuality: true, description: 'AAC in MP4 container', group: 'Common Lossy' },
  { id: 'ogg', label: 'OGG', mimeType: 'audio/ogg', extension: '.ogg', supportsQuality: true, description: 'OGG Vorbis, open format', group: 'Common Lossy' },
  { id: 'opus', label: 'Opus', mimeType: 'audio/opus', extension: '.opus', supportsQuality: true, description: 'Modern, excellent at low bitrate', group: 'Common Lossy' },
  { id: 'wma', label: 'WMA', mimeType: 'audio/x-ms-wma', extension: '.wma', supportsQuality: true, description: 'Windows Media Audio', group: 'Common Lossy' },
  // ── Broadcast / Specialty ───────────────────────────────────
  { id: 'ac3', label: 'AC3', mimeType: 'audio/ac3', extension: '.ac3', supportsQuality: true, description: 'Dolby Digital surround', group: 'Broadcast' },
  { id: 'mp2', label: 'MP2', mimeType: 'audio/mpeg', extension: '.mp2', supportsQuality: true, description: 'MPEG Audio Layer 2, broadcast', group: 'Broadcast' },
  { id: 'amr', label: 'AMR', mimeType: 'audio/amr', extension: '.amr', supportsQuality: false, description: 'Speech / voice codec', group: 'Broadcast' },
  // ── Lossless ────────────────────────────────────────────────
  { id: 'wav', label: 'WAV', mimeType: 'audio/wav', extension: '.wav', supportsQuality: false, description: 'Uncompressed PCM audio', group: 'Lossless' },
  { id: 'flac', label: 'FLAC', mimeType: 'audio/flac', extension: '.flac', supportsQuality: false, description: 'Lossless compression', group: 'Lossless' },
  { id: 'alac', label: 'ALAC', mimeType: 'audio/mp4', extension: '.m4a', supportsQuality: false, description: 'Apple Lossless', group: 'Lossless' },
  { id: 'aiff', label: 'AIFF', mimeType: 'audio/aiff', extension: '.aiff', supportsQuality: false, description: 'Uncompressed, Apple standard', group: 'Lossless' },
];

/* ── Video-to-Audio output formats (same as audio) ─────────── */

export const VIDEO_TO_AUDIO_FORMATS: readonly OutputFormat[] = AUDIO_FORMATS;

/* ── Subtitle formats ──────────────────────────────────────── */

export const SUBTITLE_FORMATS: readonly OutputFormat[] = [
  { id: 'srt', label: 'SRT', mimeType: 'application/x-subrip', extension: '.srt', supportsQuality: false, description: 'SubRip — most widely supported' },
  { id: 'vtt', label: 'VTT', mimeType: 'text/vtt', extension: '.vtt', supportsQuality: false, description: 'WebVTT — HTML5 native captions' },
];

/* ── Data / text formats ───────────────────────────────────── */

export const DATA_FORMATS: readonly OutputFormat[] = [
  { id: 'json-pretty', label: 'JSON (Pretty)', mimeType: 'application/json', extension: '.json', supportsQuality: false, description: 'Formatted with indentation', group: 'JSON' },
  { id: 'json-minify', label: 'JSON (Minified)', mimeType: 'application/json', extension: '.json', supportsQuality: false, description: 'Compact, smallest size', group: 'JSON' },
  { id: 'csv', label: 'CSV', mimeType: 'text/csv', extension: '.csv', supportsQuality: false, description: 'Comma-separated values', group: 'Tabular' },
  { id: 'tsv', label: 'TSV', mimeType: 'text/tab-separated-values', extension: '.tsv', supportsQuality: false, description: 'Tab-separated values', group: 'Tabular' },
  { id: 'yaml', label: 'YAML', mimeType: 'text/yaml', extension: '.yaml', supportsQuality: false, description: 'Human-readable data format', group: 'Markup' },
  { id: 'xml', label: 'XML', mimeType: 'application/xml', extension: '.xml', supportsQuality: false, description: 'Structured markup language', group: 'Markup' },
];

/* ── Category definitions ──────────────────────────────────── */

/** All image extensions accepted as input */
const IMAGE_EXTENSIONS = '.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp,.tif,.tiff,.avif,.heif,.heic,.jxl,.eps,.ai,.cdr,.wmf,.emf,.dng,.cr2,.cr3,.nef,.arw,.raf,.orf,.rw2,.pef,.srw,.psd,.psb,.xcf,.kra,.afphoto,.ico,.icns,.cur,.ani,.tga,.pcx,.ppm,.pgm,.pbm,.pnm,.iff,.dds,.dcm,.fits,.exr,.hdr,.pfm,.pdf';

/** All audio extensions accepted as input */
const AUDIO_EXTENSIONS = '.mp3,.wav,.ogg,.oga,.aac,.m4a,.flac,.opus,.wma,.aiff,.aif,.amr,.ac3,.dts,.mp2,.ape,.wv,.mka,.au,.snd,.caf,.spx,.voc,.tta,.mpc,.ra,.ram,.mid,.midi';

/** All audio MIME types accepted as input */
const AUDIO_MIME_TYPES: readonly string[] = [
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/flac',
  'audio/mp4', 'audio/x-m4a', 'audio/opus', 'audio/x-ms-wma', 'audio/aiff', 'audio/x-aiff',
  'audio/amr', 'audio/ac3', 'audio/x-ape', 'audio/x-wavpack', 'audio/midi',
  'audio/x-matroska', 'audio/basic', 'audio/x-caf', 'audio/x-realaudio',
];

/** All video extensions accepted as input */
const VIDEO_EXTENSIONS = '.mp4,.mov,.mkv,.avi,.webm,.mpeg,.mpg,.m4v,.wmv,.asf,.flv,.ogv,.ogg,.3gp,.3g2,.ts,.mts,.m2ts,.vob,.mxf,.gxf,.rm,.rmvb,.f4v,.divx,.amv';

/** All video MIME types accepted as input */
const VIDEO_MIME_TYPES: readonly string[] = [
  'video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/webm',
  'video/mpeg', 'video/x-m4v', 'video/x-ms-wmv', 'video/x-ms-asf', 'video/x-flv',
  'video/ogg', 'video/3gpp', 'video/3gpp2', 'video/mp2t', 'video/dvd',
  'application/mxf', 'application/vnd.rn-realmedia',
];

export const CATEGORIES: readonly CategoryConfig[] = [
  {
    id: 'image',
    label: 'Images',
    description: 'Convert between image formats',
    acceptedTypes: [
      'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp',
      'image/tiff', 'image/avif', 'image/heif', 'image/heic', 'image/jxl',
      'image/x-icon', 'image/vnd.adobe.photoshop', 'image/x-tga',
      'application/pdf', 'application/postscript',
    ],
    acceptedExtensions: IMAGE_EXTENSIONS,
    outputFormats: IMAGE_FORMATS,
    maxSizeMB: 100,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Convert video formats',
    acceptedTypes: VIDEO_MIME_TYPES,
    acceptedExtensions: VIDEO_EXTENSIONS,
    outputFormats: VIDEO_FORMATS,
    maxSizeMB: 2000,
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Convert audio formats',
    acceptedTypes: AUDIO_MIME_TYPES,
    acceptedExtensions: AUDIO_EXTENSIONS,
    outputFormats: AUDIO_FORMATS,
    maxSizeMB: 500,
  },
  {
    id: 'video-to-audio',
    label: 'Video → Audio',
    description: 'Extract audio from video files',
    acceptedTypes: VIDEO_MIME_TYPES,
    acceptedExtensions: VIDEO_EXTENSIONS,
    outputFormats: VIDEO_TO_AUDIO_FORMATS,
    maxSizeMB: 2000,
  },
  {
    id: 'video-to-animated',
    label: 'Video → Animated',
    description: 'Convert video to animated image',
    acceptedTypes: VIDEO_MIME_TYPES,
    acceptedExtensions: VIDEO_EXTENSIONS,
    outputFormats: VIDEO_TO_ANIMATED_FORMATS,
    maxSizeMB: 500,
  },
  {
    id: 'subtitle',
    label: 'Subtitles',
    description: 'Convert subtitle formats',
    acceptedTypes: ['application/x-subrip', 'text/vtt', 'text/plain'],
    acceptedExtensions: '.srt,.vtt,.sub,.ass,.ssa',
    outputFormats: SUBTITLE_FORMATS,
    maxSizeMB: 20,
  },
  {
    id: 'data',
    label: 'Data / Text',
    description: 'Convert between data formats',
    acceptedTypes: ['application/json', 'text/csv', 'text/tab-separated-values', 'text/yaml', 'application/xml', 'text/xml', 'text/plain'],
    acceptedExtensions: '.json,.csv,.tsv,.yaml,.yml,.xml',
    outputFormats: DATA_FORMATS,
    maxSizeMB: 50,
  },
];

/** Get category config by ID */
export function getCategoryConfig(id: ConverterCategory): CategoryConfig {
  const config = CATEGORIES.find((c) => c.id === id);
  if (!config) throw new Error(`Unknown category: ${id}`);
  return config;
}

/** All known image file extensions */
const IMAGE_EXTS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'tif', 'tiff',
  'avif', 'heif', 'heic', 'jxl', 'eps', 'pdf', 'ai', 'cdr', 'wmf', 'emf',
  'dng', 'cr2', 'cr3', 'nef', 'arw', 'raf', 'orf', 'rw2', 'pef', 'srw',
  'psd', 'psb', 'xcf', 'kra', 'afphoto',
  'ico', 'icns', 'cur', 'ani',
  'tga', 'pcx', 'ppm', 'pgm', 'pbm', 'pnm', 'iff', 'dds',
  'dcm', 'fits', 'exr', 'hdr', 'pfm',
]);

/** All known subtitle file extensions */
const SUBTITLE_EXTS = new Set(['srt', 'vtt', 'sub', 'ass', 'ssa']);

/** All known data / text file extensions */
const DATA_EXTS = new Set(['json', 'csv', 'tsv', 'yaml', 'yml', 'xml']);

/** All known audio file extensions */
const AUDIO_EXTS = new Set([
  'mp3', 'wav', 'ogg', 'oga', 'aac', 'm4a', 'flac', 'opus', 'wma', 'aiff', 'aif',
  'amr', 'ac3', 'dts', 'mp2', 'ape', 'wv', 'mka', 'au', 'snd', 'caf', 'spx',
  'voc', 'tta', 'mpc', 'ra', 'ram', 'mid', 'midi',
]);

/** All known video file extensions */
const VIDEO_EXTS = new Set([
  'mp4', 'mov', 'mkv', 'avi', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'asf',
  'flv', 'ogv', '3gp', '3g2', 'ts', 'mts', 'm2ts', 'vob', 'mxf', 'gxf',
  'rm', 'rmvb', 'f4v', 'divx', 'amv',
]);

/** Detect category from MIME type or file extension */
export function detectCategoryFromFile(file: File): ConverterCategory | null {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/') || type === 'application/pdf' || type === 'application/postscript') return 'image';
  if (type.startsWith('video/') || type === 'application/mxf' || type === 'application/vnd.rn-realmedia') return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type === 'application/x-subrip' || type === 'text/vtt') return 'subtitle';
  if (type === 'application/json' || type === 'text/csv' || type === 'text/yaml' || type === 'text/xml' || type === 'application/xml' || type === 'text/tab-separated-values') return 'data';
  const ext = file.name.toLowerCase().split('.').pop();
  if (IMAGE_EXTS.has(ext ?? '')) return 'image';
  if (VIDEO_EXTS.has(ext ?? '')) return 'video';
  if (AUDIO_EXTS.has(ext ?? '')) return 'audio';
  if (SUBTITLE_EXTS.has(ext ?? '')) return 'subtitle';
  if (DATA_EXTS.has(ext ?? '')) return 'data';
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
