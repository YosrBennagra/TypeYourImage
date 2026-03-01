/* ─────────────────────────────────────────────────────────────
   Audio converter — FFmpeg.wasm powered
   ───────────────────────────────────────────────────────────── */

import { fetchFile } from '@ffmpeg/util';
import { getFFmpeg, getFileExtension } from './ffmpeg-loader';
import type { OutputFormat } from './constants';

/**
 * Convert an audio file to the specified output format.
 * Loads FFmpeg.wasm on first call (downloads ~30 MB from CDN).
 */
export async function convertAudio(
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

    const args = buildAudioArgs(inputName, outputName, format, quality);
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName) as Uint8Array;
    return new Blob([new Uint8Array(data)], { type: format.mimeType });
  } finally {
    try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
    try { await ffmpeg.deleteFile(outputName); } catch { /* ignore */ }
    ffmpeg.off('progress', progressHandler);
  }
}

function buildAudioArgs(
  input: string,
  output: string,
  format: OutputFormat,
  quality: number,
): string[] {
  // Map quality 0–1 → bitrate 96–320 kbps
  const bitrate = `${Math.round(96 + quality * 224)}k`;

  switch (format.id) {
    // ── Common Lossy ───────────────────────────────────────────
    case 'mp3':
      return ['-i', input, '-vn', '-c:a', 'libmp3lame', '-b:a', bitrate, '-y', output];
    case 'aac':
      return ['-i', input, '-vn', '-c:a', 'aac', '-b:a', bitrate, '-y', output];
    case 'm4a':
      return ['-i', input, '-vn', '-c:a', 'aac', '-b:a', bitrate, '-f', 'ipod', '-y', output];
    case 'ogg':
      return ['-i', input, '-vn', '-c:a', 'libvorbis', '-b:a', bitrate, '-y', output];
    case 'opus':
      return ['-i', input, '-vn', '-c:a', 'libopus', '-b:a', bitrate, '-y', output];
    case 'wma':
      return ['-i', input, '-vn', '-c:a', 'wmav2', '-b:a', bitrate, '-y', output];
    // ── Broadcast / Specialty ──────────────────────────────────
    case 'ac3':
      return ['-i', input, '-vn', '-c:a', 'ac3', '-b:a', bitrate, '-y', output];
    case 'mp2':
      return ['-i', input, '-vn', '-c:a', 'mp2', '-b:a', bitrate, '-y', output];
    case 'amr':
      return ['-i', input, '-vn', '-c:a', 'libopencore_amrnb', '-ar', '8000', '-ac', '1', '-y', output];
    // ── Lossless ───────────────────────────────────────────────
    case 'wav':
      return ['-i', input, '-vn', '-c:a', 'pcm_s16le', '-y', output];
    case 'flac':
      return ['-i', input, '-vn', '-c:a', 'flac', '-y', output];
    case 'alac':
      return ['-i', input, '-vn', '-c:a', 'alac', '-f', 'ipod', '-y', output];
    case 'aiff':
      return ['-i', input, '-vn', '-c:a', 'pcm_s16be', '-f', 'aiff', '-y', output];
    default:
      return ['-i', input, '-vn', '-y', output];
  }
}
