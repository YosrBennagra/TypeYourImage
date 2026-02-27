import { useCallback, useState } from 'react';
import { FiRefreshCw, FiZap, FiLoader } from 'react-icons/fi';
import {
  type OutputFormat,
  type AppStatus,
  type ConverterCategory,
  DEFAULT_QUALITY,
  detectCategoryFromFile,
  getCategoryConfig,
  SIZE_WARNING_THRESHOLD,
} from './lib/constants';
import { loadImage, convertImage, downloadBlob, getBaseName } from './lib/converter';
import { convertVideo } from './lib/video-converter';
import { convertAudio } from './lib/audio-converter';
import { isFFmpegLoaded, getFFmpeg } from './lib/ffmpeg-loader';
import { CategoryTabs } from './components/category-tabs';
import { DropZone } from './components/drop-zone';
import { SourcePreview } from './components/source-preview';
import { FormatSelector } from './components/format-selector';
import { QualitySlider } from './components/quality-slider';
import { StepIndicator } from './components/step-indicator';
import { ConversionResult } from './components/conversion-result';
import { TransparencyNotice, FormatNotes } from './components/format-notes';
import { FeatureCards } from './components/feature-cards';
import { ProgressBar } from './components/progress-bar';
import { Footer } from './components/footer';

interface SourceFile {
  readonly file: File;
  readonly category: ConverterCategory;
  readonly previewUrl: string;
  readonly imageElement?: HTMLImageElement;
  readonly dimensions?: { readonly width: number; readonly height: number };
  readonly hasAlpha?: boolean;
}

interface ConversionState {
  readonly blob: Blob;
  readonly format: OutputFormat;
}

export default function App() {
  const [category, setCategory] = useState<ConverterCategory>('image');
  const [source, setSource] = useState<SourceFile | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionState | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  // ── Step calculation ─────────────────────────────────────────
  const computeStep = (): number => {
    if (!source) return 1;
    if (result) return 3;
    return 2;
  };
  const currentStep = computeStep();

  // ── Detect if image has transparency ─────────────────────────
  const detectAlpha = useCallback((img: HTMLImageElement): boolean => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.naturalWidth, 64);
      canvas.height = Math.min(img.naturalHeight, 64);
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if ((data[i] ?? 255) < 255) return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // ── Handle file upload ───────────────────────────────────────
  const handleFileSelected = useCallback(
    async (file: File) => {
      setStatus('uploading');
      setError(null);
      setResult(null);
      setSelectedFormat(null);
      setConversionProgress(0);

      try {
        // Detect category and auto-switch
        const detectedCategory = detectCategoryFromFile(file) ?? category;
        if (detectedCategory !== category) {
          setCategory(detectedCategory);
        }

        // File size warning
        const catConfig = getCategoryConfig(detectedCategory);
        if (file.size > catConfig.maxSizeMB * 1024 * 1024) {
          setError(`File exceeds ${catConfig.maxSizeMB} MB limit for ${catConfig.label.toLowerCase()} conversion.`);
          setStatus('error');
          return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (detectedCategory === 'image') {
          const element = await loadImage(file);
          const hasAlpha = file.type === 'image/svg+xml' || detectAlpha(element);

          setSource({
            file,
            category: detectedCategory,
            previewUrl,
            imageElement: element,
            dimensions: {
              width: element.naturalWidth || element.width,
              height: element.naturalHeight || element.height,
            },
            hasAlpha,
          });
        } else {
          setSource({
            file,
            category: detectedCategory,
            previewUrl,
          });

          // Pre-load FFmpeg in background for video/audio
          if (!isFFmpegLoaded()) {
            getFFmpeg().catch(() => {});
          }
        }

        setStatus('ready');
      } catch {
        setError('Failed to load file. Please try a different file.');
        setStatus('error');
      }
    },
    [category, detectAlpha],
  );

  // ── Handle conversion ────────────────────────────────────────
  const handleConvert = useCallback(async () => {
    if (!source || !selectedFormat) return;

    setError(null);
    setResult(null);
    setConversionProgress(0);

    try {
      let blob: Blob;

      if (source.category === 'image') {
        setStatus('converting');
        blob = await convertImage(source.imageElement!, selectedFormat, quality);
      } else {
        // FFmpeg-based conversion (video / audio)
        if (!isFFmpegLoaded()) {
          setStatus('loading-engine');
        }

        const progressCallback = (p: number) => {
          setStatus('converting');
          setConversionProgress(p);
        };

        if (source.category === 'video') {
          blob = await convertVideo(source.file, selectedFormat, quality, progressCallback);
        } else {
          blob = await convertAudio(source.file, selectedFormat, quality, progressCallback);
        }
      }

      setResult({ blob, format: selectedFormat });
      setStatus('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Conversion to ${selectedFormat.label} failed.`;
      setError(msg);
      setStatus('error');
    }
  }, [source, selectedFormat, quality]);

  // ── Handle download ──────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!result || !source) return;
    setIsDownloading(true);
    const baseName = getBaseName(source.file.name);
    downloadBlob(result.blob, `${baseName}${result.format.extension}`);
    setTimeout(() => setIsDownloading(false), 500);
  }, [result, source]);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (source?.previewUrl) {
      URL.revokeObjectURL(source.previewUrl);
    }
    setSource(null);
    setSelectedFormat(null);
    setQuality(DEFAULT_QUALITY);
    setStatus('idle');
    setError(null);
    setResult(null);
    setConversionProgress(0);
  }, [source]);

  // ── Convert another (keep source, clear result) ──────────────
  const handleConvertAnother = useCallback(() => {
    setResult(null);
    setSelectedFormat(null);
    setQuality(DEFAULT_QUALITY);
    setStatus('ready');
    setError(null);
    setConversionProgress(0);
  }, []);

  // ── Category change (only when no file is loaded) ────────────
  const handleCategoryChange = useCallback(
    (newCategory: ConverterCategory) => {
      if (source) return; // Don't switch mid-conversion
      setCategory(newCategory);
    },
    [source],
  );

  const showSizeWarning = source && source.file.size > SIZE_WARNING_THRESHOLD;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple">
              <FiZap className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-zinc-100 tracking-tight">
                AllYourTypes
              </h1>
              <p className="text-[10px] font-mono text-zinc-500">
                Convert anything, right in your browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StepIndicator currentStep={currentStep} />
            {source && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-800"
              >
                <FiRefreshCw className="w-3 h-3" />
                New
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 h-full">
          {!source ? (
            /* ── Upload state ─────────────────────────────────── */
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-xl flex flex-col gap-5">
                {/* Category tabs */}
                <div className="flex justify-center">
                  <CategoryTabs
                    active={category}
                    onChange={handleCategoryChange}
                    disabled={status === 'uploading'}
                  />
                </div>

                {/* Drop zone */}
                <DropZone
                  category={category}
                  onFileSelected={handleFileSelected}
                  onCategorySwitch={setCategory}
                  disabled={status === 'uploading'}
                />

                {status === 'uploading' && (
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
                    <FiLoader className="w-3.5 h-3.5 animate-spinner" />
                    Loading file...
                  </div>
                )}

                {/* Feature cards */}
                <FeatureCards />
              </div>
            </div>
          ) : (
            /* ── Conversion workspace ─────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
              {/* Left: Source preview */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col h-full">
                  <h2 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Source
                  </h2>
                  <SourcePreview
                    file={source.file}
                    previewUrl={source.previewUrl}
                    category={source.category}
                    dimensions={source.dimensions}
                  />

                  {showSizeWarning && (
                    <div className="mt-2 px-2 py-1.5 rounded bg-neon-yellow/5 border border-neon-yellow/20">
                      <p className="text-[10px] font-mono text-neon-yellow/70">
                        Large file — conversion may take a while
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-3 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                  >
                    Change file
                  </button>
                </div>
              </div>

              {/* Center: Format selection + options */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                  <h2 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Output Format
                  </h2>
                  <FormatSelector
                    category={source.category}
                    selected={selectedFormat}
                    onSelect={(fmt) => {
                      setSelectedFormat(fmt);
                      setResult(null);
                      setError(null);
                      setStatus('ready');
                    }}
                    sourceFormat={source.file.type}
                  />
                </div>

                {/* Quality + notes */}
                {selectedFormat && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col gap-3">
                    <h2 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      Options
                    </h2>

                    {selectedFormat.supportsQuality && (
                      <QualitySlider quality={quality} onChange={setQuality} />
                    )}

                    {source.category === 'image' && (
                      <TransparencyNotice
                        sourceHasAlpha={source.hasAlpha ?? false}
                        targetFormat={selectedFormat}
                      />
                    )}

                    <FormatNotes format={selectedFormat} category={source.category} />

                    {!selectedFormat.supportsQuality && (
                      <p className="text-[11px] font-mono text-zinc-600">
                        No quality settings for {selectedFormat.label}.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Action + result */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Convert button */}
                {selectedFormat && !result && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={status === 'converting' || status === 'loading-engine'}
                      className={`
                        flex items-center justify-center gap-2 w-full py-3 rounded-lg
                        font-mono font-semibold text-sm
                        ${status === 'converting' || status === 'loading-engine'
                          ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                          : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-zinc-950 hover:opacity-90'}
                        disabled:opacity-60
                      `}
                    >
                      {status === 'loading-engine' ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spinner" />
                          Loading engine...
                        </>
                      ) : status === 'converting' ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spinner" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <FiZap className="w-4 h-4" />
                          Convert to {selectedFormat.label}
                        </>
                      )}
                    </button>

                    {/* Progress bar for video/audio */}
                    {status === 'converting' && source.category !== 'image' && (
                      <div className="mt-3">
                        <ProgressBar progress={conversionProgress} label="Processing" />
                      </div>
                    )}

                    {status === 'loading-engine' && (
                      <p className="mt-2 text-[10px] font-mono text-zinc-500 text-center">
                        Downloading conversion engine (~30 MB, one-time)...
                      </p>
                    )}
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-4">
                    <ConversionResult
                      originalSize={source.file.size}
                      convertedSize={result.blob.size}
                      format={result.format}
                      onDownload={handleDownload}
                      isDownloading={isDownloading}
                    />

                    <button
                      type="button"
                      onClick={handleConvertAnother}
                      className="mt-3 w-full text-center text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                    >
                      Convert to another format
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <p className="text-sm font-mono text-red-400">{error}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStatus('ready');
                      }}
                      className="mt-2 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Converted preview (images only) */}
                {result && source.category === 'image' && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                    <h2 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Converted Preview
                    </h2>
                    <div className="flex items-center justify-center rounded-lg overflow-hidden checkerboard border border-zinc-800">
                      <img
                        src={URL.createObjectURL(result.blob)}
                        alt="Converted preview"
                        className="max-w-full max-h-[160px] object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Converted preview (video) */}
                {result && source.category === 'video' && result.format.id !== 'video-gif' && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                    <h2 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Converted Preview
                    </h2>
                    <video
                      src={URL.createObjectURL(result.blob)}
                      controls
                      className="max-w-full max-h-[160px] rounded-lg"
                    >
                      <track kind="captions" />
                    </video>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-zinc-800/60 bg-zinc-950/80 h-10">
        <Footer />
      </footer>
    </div>
  );
}
