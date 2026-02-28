/* ─────────────────────────────────────────────────────────────
   FFmpeg.wasm — Singleton loader with lazy initialization
   Uses single-threaded core (no SharedArrayBuffer required)
   ───────────────────────────────────────────────────────────── */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Get the FFmpeg instance — loads from CDN on first call, cached after.
 * Subsequent calls return the cached instance immediately.
 */
export function getFFmpeg(): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance);
  if (loadPromise) return loadPromise;

  loadPromise = loadFFmpeg();
  return loadPromise;
}

async function loadFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();

  try {
    const coreURL = await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');

    await ffmpeg.load({ coreURL, wasmURL });

    instance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    loadPromise = null; // Allow retry on failure
    throw new Error(
      `Failed to load conversion engine. Please check your internet connection and try again. ${error instanceof Error ? error.message : ''}`,
    );
  }
}

/** Check if FFmpeg is already loaded (no network needed) */
export function isFFmpegLoaded(): boolean {
  return instance !== null;
}

/** Extract file extension from filename */
export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.substring(dot) : '';
}
