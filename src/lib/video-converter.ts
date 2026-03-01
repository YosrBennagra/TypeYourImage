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
    // ── Common containers ────────────────────────────────────
    case 'mp4':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'medium', '-c:a', 'aac', '-y', output];
    case 'webm':
      return ['-i', input, '-c:v', 'libvpx', '-crf', crf, '-b:v', '1M', '-c:a', 'libvorbis', '-y', output];
    case 'mov':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'medium', '-c:a', 'aac', '-y', output];
    case 'mkv':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-preset', 'medium', '-c:a', 'aac', '-y', output];
    case 'avi':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-c:a', 'aac', '-y', output];
    case 'mpeg':
      return ['-i', input, '-c:v', 'mpeg2video', '-q:v', String(Math.round(2 + (1 - quality) * 8)), '-c:a', 'mp2', '-y', output];
    case 'm4v':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-c:a', 'aac', '-y', output];
    case 'flv':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-c:a', 'aac', '-y', output];
    case 'ogv':
      return ['-i', input, '-c:v', 'libtheora', '-q:v', String(Math.round(quality * 10)), '-c:a', 'libvorbis', '-y', output];
    case '3gp':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-c:a', 'aac', '-ar', '22050', '-y', output];
    // ── Broadcast / transport ────────────────────────────────
    case 'ts':
      return ['-i', input, '-c:v', 'libx264', '-crf', crf, '-c:a', 'aac', '-f', 'mpegts', '-y', output];
    case 'vob':
      return ['-i', input, '-c:v', 'mpeg2video', '-q:v', String(Math.round(2 + (1 - quality) * 8)), '-c:a', 'mp2', '-y', output];
    // ── Professional ─────────────────────────────────────────
    case 'mxf':
      return ['-i', input, '-c:v', 'mpeg2video', '-q:v', String(Math.round(2 + (1 - quality) * 8)), '-c:a', 'pcm_s16le', '-y', output];
    // ── Animated image from video ────────────────────────────
    case 'video-gif':
    case 'anim-gif':
      return ['-i', input, '-vf', 'fps=12,scale=480:-1:flags=lanczos', '-loop', '0', '-y', output];
    case 'anim-apng':
      return ['-i', input, '-vf', 'fps=15,scale=480:-1:flags=lanczos', '-plays', '0', '-f', 'apng', '-y', output];
    default:
      return ['-i', input, '-y', output];
  }
}
