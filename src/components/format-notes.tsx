import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import type { OutputFormat, ConverterCategory } from '../lib/constants';

interface TransparencyNoticeProps {
  readonly sourceHasAlpha: boolean;
  readonly targetFormat: OutputFormat;
}

export function TransparencyNotice({ sourceHasAlpha, targetFormat }: TransparencyNoticeProps) {
  if (!sourceHasAlpha || targetFormat.supportsTransparency) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neon-yellow/[0.04] border border-neon-yellow/15">
      <FiAlertTriangle className="w-3.5 h-3.5 text-neon-yellow shrink-0 mt-0.5" />
      <p className="text-xs text-neon-yellow/70 leading-relaxed">
        {targetFormat.label} does not support transparency. Transparent areas will use a white
        background.
      </p>
    </div>
  );
}

interface FormatNotesProps {
  readonly format: OutputFormat;
  readonly category: ConverterCategory;
}

export function FormatNotes({ format, category }: FormatNotesProps) {
  const notes: string[] = [];

  if (category === 'image') {
    if (format.id === 'gif')
      notes.push('GIF is limited to 256 colors. Complex images may lose quality.');
    if (format.id === 'bmp') notes.push('BMP files are uncompressed and can be very large.');
    if (format.id === 'webp')
      notes.push('WebP offers 25-35% better compression than JPEG at similar quality.');
    if (format.id === 'tiff')
      notes.push('TIFF uses lossless compression — ideal for professional/print work.');
    if (format.id === 'avif')
      notes.push('AVIF provides ~50% better compression than JPEG. Requires FFmpeg engine.');
    if (format.id === 'heif')
      notes.push('HEIF (HEVC-based) — used by Apple devices. Requires FFmpeg engine with x265.');
    if (format.id === 'jxl')
      notes.push('JPEG XL is a next-gen format. Browser engine support may be limited.');
    if (format.id === 'ico')
      notes.push('ICO generates a single-size icon. For multi-size ICO, use dedicated tools.');
    if (format.id === 'tga')
      notes.push('TGA (Targa) is commonly used in game development and 3D graphics.');
    if (format.id === 'exr')
      notes.push('OpenEXR is used in VFX pipelines for HDR imagery.');
    if (format.id === 'hdr')
      notes.push('Radiance HDR stores lighting data for high dynamic range images.');
    if (format.group === 'Vector')
      notes.push('Raster-to-vector conversion wraps the image — it does not trace/vectorize.');
    if (format.group === 'Camera RAW')
      notes.push('RAW format output may have limited support in the browser engine.');
    if (format.group === 'Layered')
      notes.push('Project format output creates a flat image — layers are not preserved.');
    if (['ppm', 'pgm', 'pbm', 'pnm'].includes(format.id))
      notes.push('Netpbm formats are simple uncompressed formats used in image processing.');
    if (format.id === 'dds')
      notes.push('DDS is used for GPU textures in games and 3D applications.');
    if (format.id === 'dcm')
      notes.push('DICOM is used in medical imaging. Engine support may be limited.');
    if (format.id === 'fits')
      notes.push('FITS is used in astronomy. Engine support may be limited.');
  }

  if (category === 'video') {
    if (format.id === 'video-gif')
      notes.push('Video will be resized to 480px width at 12 fps.');
    if (format.id === 'webm')
      notes.push('WebM uses VP8 — great for web with smaller file sizes.');
    if (format.id === 'mp4')
      notes.push('MP4 with H.264 — the most widely compatible format.');
    if (format.id === 'mov')
      notes.push('MOV (QuickTime) — common on Apple platforms.');
    if (format.id === 'mkv')
      notes.push('MKV is a flexible container that supports almost any codec.');
    if (format.id === 'wmv')
      notes.push('WMV uses Windows Media codecs — best for Windows compatibility.');
    if (format.id === 'flv')
      notes.push('FLV is a legacy Flash format — limited modern use.');
    if (format.id === 'ogv')
      notes.push('OGV uses Theora — open-source but lower quality than modern codecs.');
    if (format.id === '3gp')
      notes.push('3GP is designed for mobile — smaller resolution/quality.');
    if (format.id === 'ts')
      notes.push('MPEG Transport Stream — used in broadcasting and streaming.');
    if (format.id === 'vob')
      notes.push('VOB is the DVD container — uses MPEG-2 video.');
    if (format.id === 'mxf')
      notes.push('MXF is a professional broadcast format.');
    if (format.id === 'mpeg')
      notes.push('MPEG-2 video — legacy broadcast standard.');
  }

  if (category === 'video-to-animated') {
    if (format.id === 'anim-gif')
      notes.push('GIF is limited to 256 colors at 12 fps. Large videos produce big files.');
    if (format.id === 'anim-apng')
      notes.push('APNG supports full 24-bit color and transparency at 15 fps.');
    if (format.id === 'anim-webp')
      notes.push('Animated WebP offers much better compression than GIF.');
    if (format.id === 'anim-avif')
      notes.push('Animated AVIF has the best compression but slower encoding.');
    notes.push('Output will be scaled to 480px width for manageable file sizes.');
  }

  if (category === 'audio' || category === 'video-to-audio') {
    if (format.id === 'mp3')
      notes.push('MP3 is the most widely supported lossy audio format.');
    if (format.id === 'aac')
      notes.push('AAC offers better quality than MP3 at similar bitrates.');
    if (format.id === 'm4a')
      notes.push('M4A wraps AAC audio in an MP4 container — great for Apple devices.');
    if (format.id === 'ogg')
      notes.push('OGG Vorbis is an open-source lossy codec with quality comparable to MP3.');
    if (format.id === 'opus')
      notes.push('Opus excels at low bitrates — ideal for voice and streaming.');
    if (format.id === 'wma')
      notes.push('WMA uses Windows Media codecs — best for Windows ecosystem.');
    if (format.id === 'ac3')
      notes.push('AC3 (Dolby Digital) is used in broadcast and surround sound.');
    if (format.id === 'mp2')
      notes.push('MP2 (MPEG Audio Layer 2) is used in broadcasting and DVDs.');
    if (format.id === 'amr')
      notes.push('AMR is a speech codec — output is mono 8 kHz, small files.');
    if (format.id === 'wav')
      notes.push('WAV is uncompressed PCM — output will be significantly larger.');
    if (format.id === 'flac')
      notes.push('FLAC provides lossless compression at ~50% of WAV size.');
    if (format.id === 'alac')
      notes.push('ALAC (Apple Lossless) in M4A container — lossless, Apple-native.');
    if (format.id === 'aiff')
      notes.push('AIFF is Apple\'s uncompressed audio format, similar to WAV.');
    if (category === 'video-to-audio')
      notes.push('Audio will be extracted from the video stream.');
  }

  if (category === 'subtitle') {
    if (format.id === 'srt')
      notes.push('SRT (SubRip) is the most widely supported subtitle format across all players.');
    if (format.id === 'vtt')
      notes.push('WebVTT is the HTML5 standard for web video captions with styling support.');
    notes.push('Conversion preserves all cue timings and text content.');
  }

  if (category === 'data') {
    if (format.id === 'json-pretty')
      notes.push('JSON with indentation — human-readable, larger file size.');
    if (format.id === 'json-minify')
      notes.push('Minified JSON removes all whitespace — smaller file, harder to read.');
    if (format.id === 'csv')
      notes.push('CSV works best with flat arrays of objects. Nested data will be stringified.');
    if (format.id === 'tsv')
      notes.push('TSV uses tabs instead of commas — avoids quoting issues in some tools.');
    if (format.id === 'yaml')
      notes.push('YAML is human-friendly and widely used in configuration files.');
    if (format.id === 'xml')
      notes.push('XML output wraps data in structured elements. Arrays use repeated tags.');
    notes.push('All conversions run entirely in your browser — no data leaves your device.');
  }

  if (notes.length === 0) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <FiInfo className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
      <p className="text-xs text-zinc-500 leading-relaxed">{notes.join(' ')}</p>
    </div>
  );
}
