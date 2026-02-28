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
        const detectedCategory = detectCategoryFromFile(file) ?? category;
        if (detectedCategory !== category) {
          setCategory(detectedCategory);
        }

        const catConfig = getCategoryConfig(detectedCategory);
        if (file.size > catConfig.maxSizeMB * 1024 * 1024) {
          setError(
            `File exceeds ${catConfig.maxSizeMB} MB limit for ${catConfig.label.toLowerCase()} conversion.`,
          );
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
      const msg =
        err instanceof Error ? err.message : `Conversion to ${selectedFormat.label} failed.`;
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

  // ── Category change ──────────────────────────────────────────
  const handleCategoryChange = useCallback(
    (newCategory: ConverterCategory) => {
      if (source) return;
      setCategory(newCategory);
    },
    [source],
  );

  const showSizeWarning = source && source.file.size > SIZE_WARNING_THRESHOLD;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* ── Ambient glow ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-neon-cyan/[0.03] blur-[100px]" />
      </div>

      {/* ── Header (workspace only) ──────────────────────────── */}
      {source && (
        <header className="shrink-0 h-14 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm flex items-center px-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <FiZap className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-semibold tracking-tight">
              All<span className="text-neon-cyan">Your</span>Types
            </span>
          </div>
          <div className="flex-1 flex justify-center">
            <StepIndicator currentStep={currentStep} />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            New File
          </button>
        </header>
      )}

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 relative z-10">
        {!source ? (
          /* ── Landing ─────────────────────────────────────── */
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-lg flex flex-col items-center gap-8 px-4">
              {/* Brand */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-neon-cyan/[0.08] border border-neon-cyan/20 flex items-center justify-center">
                    <FiZap className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    All<span className="text-neon-cyan">Your</span>Types
                  </h1>
                </div>
                <p className="text-sm text-zinc-500 mt-1">
                  Convert files instantly — right in your browser
                </p>
              </div>

              {/* Category tabs */}
              <CategoryTabs
                active={category}
                onChange={handleCategoryChange}
                disabled={status === 'uploading'}
              />

              {/* Drop zone */}
              <div className="w-full">
                <DropZone
                  category={category}
                  onFileSelected={handleFileSelected}
                  onCategorySwitch={setCategory}
                  disabled={status === 'uploading'}
                />
              </div>

              {status === 'uploading' && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <FiLoader className="w-4 h-4 animate-spinner" />
                  Loading file…
                </div>
              )}

              {/* Feature badges */}
              <FeatureCards />
            </div>
          </div>
        ) : (
          /* ── Workspace ───────────────────────────────────── */
          <div className="max-w-5xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
            {/* Left: Source */}
            <div className="lg:col-span-5">
              <div className="glass-card h-full p-5 flex flex-col">
                <h2 className="section-title mb-4">Source File</h2>

                <SourcePreview
                  file={source.file}
                  previewUrl={source.previewUrl}
                  category={source.category}
                  dimensions={source.dimensions}
                />

                {showSizeWarning && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-neon-yellow/[0.05] border border-neon-yellow/15">
                    <p className="text-xs text-neon-yellow/70">
                      Large file — conversion may take a while
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-auto pt-4 text-xs text-zinc-600 hover:text-zinc-300"
                >
                  Change file
                </button>
              </div>
            </div>

            {/* Right: Convert */}
            <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto">
              {/* Format selector */}
              <div className="glass-card p-5">
                <h2 className="section-title mb-4">Output Format</h2>
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

              {/* Options */}
              {selectedFormat && (
                <div className="glass-card p-5 space-y-3">
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
                    <p className="text-xs text-zinc-600">
                      No quality settings for {selectedFormat.label}.
                    </p>
                  )}
                </div>
              )}

              {/* Convert button */}
              {selectedFormat && !result && (
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={status === 'converting' || status === 'loading-engine'}
                  className="convert-btn"
                >
                  {status === 'loading-engine' ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spinner" />
                      Loading engine…
                    </>
                  ) : status === 'converting' ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spinner" />
                      Converting…
                    </>
                  ) : (
                    <>
                      <FiZap className="w-4 h-4" />
                      Convert to {selectedFormat.label}
                    </>
                  )}
                </button>
              )}

              {/* Progress */}
              {status === 'converting' && source.category !== 'image' && (
                <ProgressBar progress={conversionProgress} label="Processing" />
              )}

              {status === 'loading-engine' && (
                <p className="text-xs text-zinc-600 text-center">
                  Downloading engine (~30 MB, one-time)…
                </p>
              )}

              {/* Result */}
              {result && (
                <div className="glass-card-success p-5">
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
                    className="mt-3 w-full text-xs text-zinc-600 hover:text-zinc-300 text-center"
                  >
                    Convert to another format
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="glass-card-error p-5">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStatus('ready');
                    }}
                    className="mt-2 text-xs text-zinc-600 hover:text-zinc-300"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Converted preview (image) */}
              {result && source.category === 'image' && (
                <div className="glass-card p-5">
                  <h2 className="section-title mb-3">Preview</h2>
                  <div className="flex items-center justify-center rounded-lg overflow-hidden checkerboard border border-white/[0.04]">
                    <img
                      src={URL.createObjectURL(result.blob)}
                      alt="Converted"
                      className="max-w-full max-h-40 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Converted preview (video) */}
              {result && source.category === 'video' && result.format.id !== 'video-gif' && (
                <div className="glass-card p-5">
                  <h2 className="section-title mb-3">Preview</h2>
                  <video
                    src={URL.createObjectURL(result.blob)}
                    controls
                    className="max-w-full max-h-40 rounded-lg"
                  >
                    <track kind="captions" />
                  </video>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 border-t border-white/[0.04]">
        <Footer />
      </footer>
    </div>
  );
}
