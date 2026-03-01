import { useCallback, useEffect, useState, useRef } from 'react';
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
import { loadImage, convertImage, isCanvasFormat, downloadBlob, getBaseName } from './lib/converter';
import { convertVideo } from './lib/video-converter';
import { convertAudio } from './lib/audio-converter';
import { convertSubtitle } from './lib/subtitle-converter';
import { convertData } from './lib/data-converter';
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
import { HowItWorks } from './components/how-it-works';
import { FaqSection } from './components/faq-section';
import { SupportedFormats } from './components/supported-formats';
import { ServerComingSoon } from './components/server-coming-soon';
import { useToast } from './hooks/use-toast';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useConversionTimer } from './hooks/use-conversion-timer';

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

/** Inline text preview for subtitle / data results */
function TextPreview({ blob }: { blob: Blob }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => { blob.text().then(setText); }, [blob]);

  if (!text) return null;
  return (
    <div className="glass-card p-5 animate-fade-in">
      <h2 className="section-title mb-3">Preview</h2>
      <pre className="max-h-48 overflow-auto rounded-lg bg-black/30 border border-white/[0.05] p-3 text-xs text-zinc-400 font-mono whitespace-pre-wrap break-words">
        {text.length > 4000 ? text.slice(0, 4000) + '\n\n… (truncated)' : text}
      </pre>
    </div>
  );
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
  const [conversionTimeMs, setConversionTimeMs] = useState(0);
  const [showServerPanel, setShowServerPanel] = useState(false);
  const resultPreviewUrl = useRef<string | null>(null);
  const { toast } = useToast();
  const timer = useConversionTimer();

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
        // Stay in video-to-audio / video-to-animated mode when a video file is dropped
        const effectiveCategory =
          (category === 'video-to-audio' || category === 'video-to-animated') && detectedCategory === 'video'
            ? category
            : detectedCategory;

        // Close server panel if open
        if (showServerPanel) setShowServerPanel(false);

        if (effectiveCategory !== category) {
          setCategory(effectiveCategory);
        }

        const catConfig = getCategoryConfig(effectiveCategory);
        if (file.size > catConfig.maxSizeMB * 1024 * 1024) {
          setError(
            `File exceeds ${catConfig.maxSizeMB} MB limit for ${catConfig.label.toLowerCase()} conversion.`,
          );
          setStatus('error');
          return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (effectiveCategory === 'image') {
          // Try to load as browser image; exotic formats may fail
          let element: HTMLImageElement | undefined;
          let hasAlpha = false;
          let dims: { width: number; height: number } | undefined;

          try {
            element = await loadImage(file);
            hasAlpha = file.type === 'image/svg+xml' || detectAlpha(element);
            dims = {
              width: element.naturalWidth || element.width,
              height: element.naturalHeight || element.height,
            };
          } catch {
            // Browser can't render this format — FFmpeg will handle conversion
          }

          setSource({
            file,
            category: effectiveCategory,
            previewUrl,
            imageElement: element,
            dimensions: dims,
            hasAlpha,
          });

          // Pre-load FFmpeg if the image couldn't be loaded in browser
          if (!element && !isFFmpegLoaded()) {
            getFFmpeg().catch(() => { });
          }
        } else if (effectiveCategory === 'subtitle' || effectiveCategory === 'data') {
          // Text-based categories — no FFmpeg needed
          setSource({ file, category: effectiveCategory, previewUrl });
        } else {
          setSource({
            file,
            category: effectiveCategory,
            previewUrl,
          });

          if (!isFFmpegLoaded()) {
            getFFmpeg().catch(() => { });
          }
        }

        setStatus('ready');
      } catch {
        setError('Failed to load file. Please try a different file.');
        setStatus('error');
      }
    },
    [category, detectAlpha, showServerPanel],
  );

  // ── Handle conversion ────────────────────────────────────────
  const handleConvert = useCallback(async () => {
    if (!source || !selectedFormat) return;

    setError(null);
    setResult(null);
    setConversionProgress(0);
    setConversionTimeMs(0);
    timer.start();

    try {
      let blob: Blob;

      if (source.category === 'image') {
        const useCanvas = isCanvasFormat(selectedFormat.id) && !!source.imageElement;

        if (useCanvas) {
          setStatus('converting');
        } else if (!isFFmpegLoaded()) {
          setStatus('loading-engine');
        }

        const progressCallback = useCanvas
          ? undefined
          : (p: number) => {
            setStatus('converting');
            setConversionProgress(p);
          };

        blob = await convertImage(
          source.imageElement,
          source.file,
          selectedFormat,
          quality,
          progressCallback,
        );
      } else {
        if (!isFFmpegLoaded()) {
          setStatus('loading-engine');
        }

        const progressCallback = (p: number) => {
          setStatus('converting');
          setConversionProgress(p);
        };

        if (source.category === 'video' || source.category === 'video-to-animated') {
          blob = await convertVideo(source.file, selectedFormat, quality, progressCallback);
        } else if (source.category === 'subtitle') {
          setStatus('converting');
          blob = await convertSubtitle(source.file, selectedFormat, quality, (p) => {
            setConversionProgress(p);
          });
        } else if (source.category === 'data') {
          setStatus('converting');
          blob = await convertData(source.file, selectedFormat, quality, (p) => {
            setConversionProgress(p);
          });
        } else {
          // audio and video-to-audio both use the audio converter
          blob = await convertAudio(source.file, selectedFormat, quality, progressCallback);
        }
      }

      const elapsed = timer.stop();
      setConversionTimeMs(elapsed);
      setResult({ blob, format: selectedFormat });
      setStatus('success');
      toast(`Converted to ${selectedFormat.label} in ${timer.format(elapsed)}`, 'success');
    } catch (err) {
      timer.stop();
      const msg =
        err instanceof Error ? err.message : `Conversion to ${selectedFormat.label} failed.`;
      setError(msg);
      setStatus('error');
      toast('Conversion failed', 'error');
    }
  }, [source, selectedFormat, quality, timer, toast]);

  // ── Handle download ──────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!result || !source) return;
    setIsDownloading(true);
    const baseName = getBaseName(source.file.name);
    downloadBlob(result.blob, `${baseName}${result.format.extension}`);
    toast('Download started', 'success');
    setTimeout(() => setIsDownloading(false), 500);
  }, [result, source, toast]);

  // ── Copy to clipboard ────────────────────────────────────────
  const handleCopyToClipboard = useCallback(async () => {
    if (!result) return;
    try {
      if (result.format.mimeType === 'image/png' && navigator.clipboard?.write) {
        const item = new ClipboardItem({ 'image/png': result.blob });
        await navigator.clipboard.write([item]);
        toast('Copied to clipboard', 'success');
      } else {
        toast('Clipboard copy only supported for PNG images', 'info');
      }
    } catch {
      toast('Failed to copy to clipboard', 'error');
    }
  }, [result, toast]);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (source?.previewUrl) {
      URL.revokeObjectURL(source.previewUrl);
    }
    if (resultPreviewUrl.current) {
      URL.revokeObjectURL(resultPreviewUrl.current);
      resultPreviewUrl.current = null;
    }
    setSource(null);
    setSelectedFormat(null);
    setQuality(DEFAULT_QUALITY);
    setStatus('idle');
    setError(null);
    setResult(null);
    setConversionProgress(0);
    setConversionTimeMs(0);
  }, [source]);

  // ── Convert another (keep source, clear result) ──────────────
  const handleConvertAnother = useCallback(() => {
    setResult(null);
    setSelectedFormat(null);
    setQuality(DEFAULT_QUALITY);
    setStatus('ready');
    setError(null);
    setConversionProgress(0);
    setConversionTimeMs(0);
  }, []);

  // ── Category change ──────────────────────────────────────────
  const handleCategoryChange = useCallback(
    (newCategory: ConverterCategory) => {
      if (source) return;
      setShowServerPanel(false);
      setCategory(newCategory);
    },
    [source],
  );

  // ── Server panel toggle ──────────────────────────────────────
  const handleServerTabClick = useCallback(() => {
    if (source) return;
    setShowServerPanel((prev) => !prev);
  }, [source]);

  // ── Keyboard shortcuts ───────────────────────────────────────
  useKeyboardShortcuts({
    onPasteFile: (file: File) => { void handleFileSelected(file); },
    onCategorySwitch: setCategory,
    onReset: handleReset,
    hasSource: !!source,
    isConverting: status === 'converting' || status === 'loading-engine',
  });

  const showSizeWarning = source && source.file.size > SIZE_WARNING_THRESHOLD;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Skip to content (accessibility) ──────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-neon-cyan focus:text-zinc-950 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      {/* ── Ambient warmth ────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-neon-cyan/[0.015] to-transparent" />
      </div>

      {/* ── Header (workspace only) ──────────────────────── */}
      {source && (
        <header className="sticky top-0 shrink-0 h-14 border-b border-white/[0.05] bg-[#0a0a0a]/90 backdrop-blur-md flex items-center px-6 z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight">
              All<span className="text-neon-cyan">Your</span>Types
            </span>
          </div>
          <div className="flex-1 flex justify-center">
            <StepIndicator currentStep={currentStep} />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            title="Reset (Esc)"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            New File
          </button>
        </header>
      )}

      {/* ── Main ─────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 relative z-10">
        {!source ? (
          /* ── Landing ─────────────────────────────────── */
          <div className="flex flex-col lg:flex-row min-h-screen">

            {/* ── Left rail (spans full page height) ──── */}
            <aside className="shrink-0 lg:w-[220px] lg:border-r border-white/[0.05] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto p-5 flex flex-col gap-6">
              {/* Brand */}
              <div className="animate-fade-in">
                <h1 className="text-xl font-bold tracking-tighter leading-none">
                  All<span className="text-neon-cyan">Your</span>Types
                </h1>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Browser-native converter
                </p>
              </div>

              {/* Category tabs (vertical) */}
              <div className="animate-fade-in-delay-1">
                <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-2 px-1">Categories</p>
                <CategoryTabs
                  active={category}
                  onChange={handleCategoryChange}
                  disabled={status === 'uploading'}
                  showServerPanel={showServerPanel}
                  onServerTabClick={handleServerTabClick}
                />
              </div>

              {/* Feature list (bottom of rail) */}
              <div className="mt-auto animate-fade-in-delay-3 hidden lg:block">
                <div className="h-px bg-white/[0.04] mb-3" />
                <FeatureCards />
              </div>
            </aside>

            {/* ── Right column (hero + below-fold, seamlessly) */}
            <div className="flex-1 flex flex-col min-w-0">

              {/* Hero — two sub-columns inside the right area */}
              <div className="flex flex-col lg:flex-row min-h-screen">

                {/* Left sub-column: hero text + drop zone */}
                <div className="flex-1 flex flex-col justify-center px-6 lg:px-10 py-10 lg:border-r border-white/[0.04]">
                  <div className="animate-fade-in mb-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[0.95] text-zinc-100">
                      Convert anything,<br />
                      <span className="text-neon-cyan">privately.</span>
                    </h2>
                    <p className="text-sm text-zinc-500 mt-3 max-w-md leading-relaxed">
                      Images, videos, audio, subtitles & data — 200+ formats, zero uploads.
                    </p>
                  </div>

                  {showServerPanel && (
                    <div className="animate-fade-in-delay-2">
                      <ServerComingSoon />
                    </div>
                  )}

                  {!showServerPanel && (
                    <div className="animate-fade-in-delay-2">
                      <DropZone
                        category={category}
                        onFileSelected={handleFileSelected}
                        onCategorySwitch={setCategory}
                        disabled={status === 'uploading'}
                      />
                    </div>
                  )}

                  {status === 'uploading' && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-4">
                      <FiLoader className="w-4 h-4 animate-spinner" />
                      Loading file…
                    </div>
                  )}

                  <div className="mt-6 lg:hidden animate-fade-in-delay-3">
                    <FeatureCards />
                  </div>
                </div>

                {/* Right sub-column: info panel */}
                <div className="hidden lg:flex w-[280px] xl:w-[320px] shrink-0 flex-col gap-4 px-7 py-10 justify-center animate-fade-in-delay-1">
                  {/* Stat cards */}
                  <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.04] p-5 space-y-4">
                    <div>
                      <span className="text-4xl font-bold tracking-tighter text-neon-cyan">200+</span>
                      <p className="text-xs text-zinc-500 mt-0.5">supported formats</p>
                    </div>
                    <div className="h-px bg-white/[0.04]" />
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Image', count: '55+', color: 'text-neon-cyan' },
                        { label: 'Video', count: '13+', color: 'text-neon-purple' },
                        { label: 'Audio', count: '14+', color: 'text-neon-green' },
                        { label: 'Data', count: '5', color: 'text-zinc-400' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-2.5">
                          <span className={`text-xl font-bold ${s.color}`}>{s.count}</span>
                          <p className="text-[10px] text-zinc-600 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy card */}
                  <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.04] p-5 space-y-3">
                    <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Privacy</p>
                    {[
                      'Files never leave your device',
                      'No account needed',
                      'No file size tracking',
                      'Works offline',
                    ].map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-neon-green/60 shrink-0" />
                        <span className="text-[12px] text-zinc-400">{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Paste tip */}
                  <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.04] p-4 flex items-center gap-3">
                    <kbd className="text-[11px] font-mono px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 shrink-0">
                      Ctrl+V
                    </kbd>
                    <span className="text-[12px] text-zinc-500">Paste an image directly from clipboard</span>
                  </div>
                </div>
              </div>

              {/* Below-fold — full width of right column */}
              <div className="border-t border-white/[0.04] px-6 lg:px-10 py-12 space-y-5">
                <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.04] p-6">
                  <HowItWorks />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.04] p-6">
                    <SupportedFormats />
                  </div>
                  <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.04] p-6">
                    <FaqSection />
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ── Workspace ───────────────────────────────── */
          <div className="max-w-2xl mx-auto flex flex-col gap-4 p-5 pt-6">
            {/* Source: compact horizontal card */}
            <div className="glass-card p-4 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="section-title mb-3">Source File</h2>
                  <SourcePreview
                    file={source.file}
                    previewUrl={source.previewUrl}
                    category={source.category}
                    dimensions={source.dimensions}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="shrink-0 text-xs text-zinc-600 hover:text-zinc-300 transition-colors mt-1"
                >
                  Change file
                </button>
              </div>

              {showSizeWarning && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-neon-yellow/[0.05] border border-neon-yellow/15">
                  <p className="text-xs text-neon-yellow/70">
                    Large file — conversion may take a while
                  </p>
                </div>
              )}
            </div>

            {/* Format selector */}
            <div className="glass-card p-5 animate-fade-in">
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
              <div className="glass-card p-5 space-y-3 animate-fade-in">
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
            {status === 'converting' && (source.category !== 'image' || (!source.imageElement || !isCanvasFormat(selectedFormat?.id ?? ''))) && (
              <ProgressBar progress={conversionProgress} label="Processing" />
            )}

            {status === 'loading-engine' && (
              <p className="text-xs text-zinc-600 text-center">
                Downloading engine (~30 MB, one-time)…
              </p>
            )}

            {/* Result */}
            {result && (
              <div className="glass-card-success p-5 animate-fade-in">
                <ConversionResult
                  originalSize={source.file.size}
                  convertedSize={result.blob.size}
                  format={result.format}
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                  conversionTimeMs={conversionTimeMs}
                  onCopyToClipboard={
                    source.category === 'image' && result.format.mimeType === 'image/png'
                      ? handleCopyToClipboard
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={handleConvertAnother}
                  className="mt-3 w-full text-xs text-zinc-600 hover:text-zinc-300 text-center transition-colors"
                >
                  Convert to another format
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="glass-card-error p-5 animate-fade-in">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStatus('ready');
                  }}
                  className="mt-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Converted preview (image) */}
            {result && source.category === 'image' && (
              <div className="glass-card p-5 animate-fade-in">
                <h2 className="section-title mb-3">Preview</h2>
                <div className="flex items-center justify-center rounded-lg overflow-hidden checkerboard border border-white/[0.05]">
                  <img
                    src={URL.createObjectURL(result.blob)}
                    alt="Converted"
                    className="max-w-full max-h-40 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Converted preview (video) */}
            {result && source.category === 'video' && !result.format.mimeType.startsWith('image/') && (
              <div className="glass-card p-5 animate-fade-in">
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

            {/* Converted preview (animated image from video) */}
            {result && (source.category === 'video-to-animated' || (source.category === 'video' && result.format.mimeType.startsWith('image/'))) && (
              <div className="glass-card p-5 animate-fade-in">
                <h2 className="section-title mb-3">Preview</h2>
                <div className="flex items-center justify-center rounded-lg overflow-hidden checkerboard border border-white/[0.05]">
                  <img
                    src={URL.createObjectURL(result.blob)}
                    alt="Animated"
                    className="max-w-full max-h-40 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Converted preview (audio or video-to-audio) */}
            {result && (source.category === 'audio' || source.category === 'video-to-audio') && (
              <div className="glass-card p-5 animate-fade-in">
                <h2 className="section-title mb-3">Preview</h2>
                <audio
                  src={URL.createObjectURL(result.blob)}
                  controls
                  className="w-full"
                >
                  <track kind="captions" />
                </audio>
              </div>
            )}

            {/* Converted preview (subtitle / data — text) */}
            {result && (source.category === 'subtitle' || source.category === 'data') && (
              <TextPreview blob={result.blob} />
            )}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 border-t border-white/[0.05]">
        <Footer />
      </footer>
    </div>
  );
}
