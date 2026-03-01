import { useCallback, useEffect, useState, useRef } from 'react';
import { FiRefreshCw, FiZap, FiLoader, FiLock, FiArrowRight, FiMusic, FiFileText, FiFilm } from 'react-icons/fi';
import {
  type OutputFormat,
  type AppStatus,
  type ConverterCategory,
  DEFAULT_QUALITY,
  detectCategoryFromFile,
  getCategoryConfig,
  SIZE_WARNING_THRESHOLD,
} from './lib/constants';
import { loadImage, convertImage, isCanvasFormat, isCustomFormat, downloadBlob, getBaseName } from './lib/converter';
import { convertVideo } from './lib/video-converter';
import { convertAudio } from './lib/audio-converter';
import { convertSubtitle } from './lib/subtitle-converter';
import { convertData } from './lib/data-converter';
import { isFFmpegLoaded, getFFmpeg } from './lib/ffmpeg-loader';
import { CategoryTabs } from './components/category-tabs';
import { DropZone } from './components/drop-zone';
// SourcePreview not used in compact workspace layout
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
        const useCustom = isCustomFormat(selectedFormat.id);

        if (useCanvas || useCustom) {
          setStatus('converting');
        } else if (!isFFmpegLoaded()) {
          setStatus('loading-engine');
        }

        const progressCallback = (useCanvas || useCustom)
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
          <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">

            {/* Main area: two columns — format picker left, configure right */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

              {/* Left: format selector (scrollable if needed) */}
              <div className="flex-1 min-w-0 overflow-y-auto p-5 border-b lg:border-b-0 lg:border-r border-white/[0.04]">
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

              {/* Right: Configure panel */}
              <div className="shrink-0 lg:w-[320px] xl:w-[360px] flex flex-col overflow-y-auto">

                {/* Source preview block */}
                <div className="p-5 border-b border-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">Source</span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      Change file
                    </button>
                  </div>

                  {/* Image thumbnail */}
                  {source.category === 'image' && source.previewUrl && (
                    <div className="rounded-lg overflow-hidden checkerboard border border-white/[0.05] mb-3 flex items-center justify-center" style={{ maxHeight: '130px' }}>
                      <img src={source.previewUrl} alt="" className="max-w-full max-h-[130px] object-contain" />
                    </div>
                  )}

                  {/* Video thumbnail */}
                  {(source.category === 'video' || source.category === 'video-to-audio' || source.category === 'video-to-animated') && (
                    <div className="rounded-lg border border-white/[0.05] bg-black/30 mb-3 flex items-center justify-center overflow-hidden" style={{ height: '90px' }}>
                      <video src={source.previewUrl} className="max-w-full max-h-full" />
                    </div>
                  )}

                  {/* Audio */}
                  {source.category === 'audio' && (
                    <div className="rounded-lg border border-white/[0.05] bg-black/20 mb-3 flex flex-col items-center justify-center gap-2.5 py-4">
                      <FiMusic className="w-6 h-6 text-neon-purple/50" />
                      <audio src={source.previewUrl} controls className="w-full h-8 opacity-70"><track kind="captions" /></audio>
                    </div>
                  )}

                  {/* Subtitle / Data — just icon */}
                  {(source.category === 'subtitle' || source.category === 'data') && (
                    <div className="rounded-lg border border-white/[0.05] bg-black/20 mb-3 flex items-center justify-center" style={{ height: '70px' }}>
                      <FiFileText className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}

                  {/* File metadata */}
                  <p className="text-sm text-zinc-300 font-medium truncate" title={source.file.name}>
                    {source.file.name}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {source.dimensions ? `${source.dimensions.width} × ${source.dimensions.height}  ·  ` : ''}
                    {source.file.size >= 1_000_000
                      ? `${(source.file.size / 1_000_000).toFixed(1)} MB`
                      : `${Math.round(source.file.size / 1000)} KB`}
                    {'  ·  '}{(source.file.name.split('.').pop() ?? '').toUpperCase()}
                  </p>
                  {showSizeWarning && (
                    <p className="text-[10px] text-neon-yellow/60 mt-1">Large file — conversion may take a while</p>
                  )}
                </div>

                {/* Configure section */}
                <div className="flex-1 flex flex-col gap-3 p-5">

                  {/* No format selected — info cards */}
                  {!selectedFormat && !result && (
                    <>
                      <p className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                        <FiArrowRight className="w-3 h-3 rotate-180 shrink-0" />
                        Choose an output format on the left
                      </p>
                      <div className="space-y-2 mt-1">
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
                          <div className="flex items-start gap-2.5">
                            <FiLock className="w-3.5 h-3.5 text-neon-green/60 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-zinc-300 font-medium mb-0.5">100% local processing</p>
                              <p className="text-[11px] text-zinc-600 leading-relaxed">Files never leave your browser. No uploads, no servers, no logs.</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
                          <div className="flex items-start gap-2.5">
                            <FiZap className="w-3.5 h-3.5 text-neon-cyan/60 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-zinc-300 font-medium mb-0.5">Fast conversion</p>
                              <p className="text-[11px] text-zinc-600 leading-relaxed">Most formats convert instantly using your browser's built-in APIs and GPU.</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
                          <div className="flex items-start gap-2.5">
                            <FiFilm className="w-3.5 h-3.5 text-neon-purple/60 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-zinc-300 font-medium mb-0.5">200+ formats</p>
                              <p className="text-[11px] text-zinc-600 leading-relaxed">Images, video, audio, subtitles, and data formats — all in one place.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Format selected — output label + options */}
                  {selectedFormat && !result && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 block mb-1.5">Output</span>
                        <div className="flex items-center gap-2">
                          <FiArrowRight className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                          <span className="text-sm font-semibold text-zinc-200">{selectedFormat.label}</span>
                          <span className="text-[10px] text-zinc-700 ml-auto font-mono">.{selectedFormat.id}</span>
                        </div>
                      </div>
                      {selectedFormat.supportsQuality && (
                        <QualitySlider quality={quality} onChange={setQuality} />
                      )}
                      {source.category === 'image' && (
                        <TransparencyNotice sourceHasAlpha={source.hasAlpha ?? false} targetFormat={selectedFormat} />
                      )}
                      <FormatNotes format={selectedFormat} category={source.category} />
                    </div>
                  )}

                  {/* Convert button */}
                  {selectedFormat && !result && (
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={status === 'converting' || status === 'loading-engine'}
                      className="convert-btn mt-auto"
                    >
                      {status === 'loading-engine' ? (
                        <><FiLoader className="w-4 h-4 animate-spinner" /> Loading engine…</>
                      ) : status === 'converting' ? (
                        <><FiLoader className="w-4 h-4 animate-spinner" /> Converting…</>
                      ) : (
                        <><FiZap className="w-4 h-4" /> Convert to {selectedFormat.label}</>
                      )}
                    </button>
                  )}

                  {/* Progress */}
                  {status === 'converting' && (source.category !== 'image' || (!source.imageElement || (!isCanvasFormat(selectedFormat?.id ?? '') && !isCustomFormat(selectedFormat?.id ?? '')))) && (
                    <ProgressBar progress={conversionProgress} label="Processing" />
                  )}
                  {status === 'loading-engine' && (
                    <p className="text-xs text-zinc-600 text-center">Downloading engine (~30 MB, one-time)…</p>
                  )}

                  {/* Result */}
                  {result && (
                    <div className="glass-card-success p-4 animate-fade-in">
                      <ConversionResult
                        originalSize={source.file.size}
                        convertedSize={result.blob.size}
                        format={result.format}
                        onDownload={handleDownload}
                        isDownloading={isDownloading}
                        conversionTimeMs={conversionTimeMs}
                        onCopyToClipboard={
                          source.category === 'image' && result.format.mimeType === 'image/png'
                            ? handleCopyToClipboard : undefined
                        }
                      />
                      <button
                        type="button"
                        onClick={handleConvertAnother}
                        className="mt-2 w-full text-xs text-zinc-600 hover:text-zinc-300 text-center transition-colors"
                      >
                        Convert to another format
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="glass-card-error p-4 animate-fade-in">
                      <p className="text-sm text-red-400">{error}</p>
                      <button type="button" onClick={() => { setError(null); setStatus('ready'); }}
                        className="mt-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Compact result previews */}
                  {result && source.category === 'image' && (
                    <div className="rounded-xl overflow-hidden checkerboard border border-white/[0.05]">
                      <img src={URL.createObjectURL(result.blob)} alt="Converted" className="max-w-full max-h-28 object-contain mx-auto" />
                    </div>
                  )}
                  {result && source.category === 'video' && !result.format.mimeType.startsWith('image/') && (
                    <video src={URL.createObjectURL(result.blob)} controls className="max-w-full max-h-28 rounded-lg">
                      <track kind="captions" />
                    </video>
                  )}
                  {result && (source.category === 'video-to-animated' || (source.category === 'video' && result.format.mimeType.startsWith('image/'))) && (
                    <div className="rounded-xl overflow-hidden checkerboard border border-white/[0.05]">
                      <img src={URL.createObjectURL(result.blob)} alt="Animated" className="max-w-full max-h-28 object-contain mx-auto" />
                    </div>
                  )}
                  {result && (source.category === 'audio' || source.category === 'video-to-audio') && (
                    <audio src={URL.createObjectURL(result.blob)} controls className="w-full"><track kind="captions" /></audio>
                  )}
                  {result && (source.category === 'subtitle' || source.category === 'data') && (
                    <TextPreview blob={result.blob} />
                  )}

                </div>
              </div>
            </div>
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
