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
    case 'mp3':
      return ['-i', input, '-c:a', 'libmp3lame', '-b:a', bitrate, '-y', output];
    case 'wav':
      return ['-i', input, '-c:a', 'pcm_s16le', '-y', output];
    case 'ogg':
      return ['-i', input, '-c:a', 'libvorbis', '-b:a', bitrate, '-y', output];
    case 'aac':
      return ['-i', input, '-c:a', 'aac', '-b:a', bitrate, '-y', output];
    case 'flac':
      return ['-i', input, '-c:a', 'flac', '-y', output];
    default:
      return ['-i', input, '-y', output];
  }
}
