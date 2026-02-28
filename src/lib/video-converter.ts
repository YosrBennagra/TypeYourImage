/* ─────────────────────────────────────────────────────────────
   Video converter — FFmpeg.wasm powered
   ───────────────────────────────────────────────────────────── */

import { fetchFile } from '@ffmpeg/util';
import { getFFmpeg, getFileExtension } from './ffmpeg-loader';
import type { OutputFormat } from './constants';

/**
 * Convert a video file to the specified output format.
 * Loads FFmpeg.wasm on first call (downloads ~30 MB from CDN).
 */
export async function convertVideo(
  file: File,
  format: OutputFormat,
  quality: number,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const ffmpeg = await getFFmpeg();

  // Track conversion progress
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.max(0, Math.min(1, progress)));
  };
  ffmpeg.on('progress', progressHandler);

  const inputName = `input${getFileExtension(file.name)}`;
  const outputName = `output${format.extension}`;

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const args = buildVideoArgs(inputName, outputName, format, quality);
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName) as Uint8Array;
    return new Blob([new Uint8Array(data)], { type: format.mimeType });
  } finally {
    // Cleanup temp files
    try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
    try { await ffmpeg.deleteFile(outputName); } catch { /* ignore */ }
    ffmpeg.off('progress', progressHandler);
  }
}

function buildVideoArgs(
  input: string,
  output: string,
  format: OutputFormat,
  quality: number,
): string[] {
  // Map quality 0–1 → CRF 40–10 (lower CRF = higher quality)
  const crf = String(Math.round(40 - quality * 30));

  switch (format.id) {
    case 'mp4':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'medium', '-c:a', 'aac', '-y', output];
    case 'webm':
      return ['-i', input, '-c:v', 'libvpx', '-crf', crf, '-b:v', '1M', '-c:a', 'libvorbis', '-y', output];
    case 'video-gif':
      return ['-i', input, '-vf', 'fps=12,scale=480:-1:flags=lanczos', '-loop', '0', '-y', output];
    case 'avi':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-c:a', 'aac', '-y', output];
    default:
      return ['-i', input, '-y', output];
  }
}
