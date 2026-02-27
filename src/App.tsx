import { useCallback, useState } from 'react';
import { FiRefreshCw, FiZap, FiLoader } from 'react-icons/fi';
import { Analytics } from '@vercel/analytics/react';
import { type OutputFormat, type AppStatus, DEFAULT_QUALITY } from './lib/constants';
import { loadImage, convertImage, downloadBlob, getBaseName } from './lib/converter';
import { DropZone } from './components/drop-zone';
import { ImagePreview } from './components/image-preview';
import { FormatSelector } from './components/format-selector';
import { QualitySlider } from './components/quality-slider';
import { StepIndicator } from './components/step-indicator';
import { ConversionResult } from './components/conversion-result';
import { TransparencyNotice, FormatNotes } from './components/format-notes';
import { Footer } from './components/footer';

interface SourceImage {
  readonly file: File;
  readonly element: HTMLImageElement;
  readonly previewUrl: string;
  readonly dimensions: { readonly width: number; readonly height: number };
  readonly hasAlpha: boolean;
}

interface ConversionState {
  readonly blob: Blob;
  readonly format: OutputFormat;
}

export default function App() {
  const [source, setSource] = useState<SourceImage | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionState | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

      try {
        const element = await loadImage(file);
        const previewUrl = URL.createObjectURL(file);
        const hasAlpha = file.type === 'image/svg+xml' || detectAlpha(element);

        setSource({
          file,
          element,
          previewUrl,
          dimensions: {
            width: element.naturalWidth || element.width,
            height: element.naturalHeight || element.height,
          },
          hasAlpha,
        });
        setStatus('ready');
      } catch {
        setError('Failed to load image. Please try a different file.');
        setStatus('error');
      }
    },
    [detectAlpha],
  );

  // ── Handle conversion ────────────────────────────────────────
  const handleConvert = useCallback(async () => {
    if (!source || !selectedFormat) return;

    setStatus('converting');
    setError(null);
    setResult(null);

    try {
      const blob = await convertImage(source.element, selectedFormat, quality);
      setResult({ blob, format: selectedFormat });
      setStatus('success');
    } catch {
      setError(`Conversion to ${selectedFormat.label} failed. Please try again.`);
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
  }, [source]);

  // ── Convert another (keep source, clear result) ──────────────
  const handleConvertAnother = useCallback(() => {
    setResult(null);
    setSelectedFormat(null);
    setQuality(DEFAULT_QUALITY);
    setStatus('ready');
    setError(null);
  }, []);

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
                TypeYourImage
              </h1>
              <p className="text-[10px] font-mono text-zinc-500">
                Free image format converter
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
              <div className="w-full max-w-xl">
                <DropZone onFileSelected={handleFileSelected} disabled={status === 'uploading'} />
                {status === 'uploading' && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
                    <FiLoader className="w-3.5 h-3.5 animate-spinner" />
                    Loading image...
                  </div>
                )}
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
                  <ImagePreview
                    file={source.file}
                    previewUrl={source.previewUrl}
                    dimensions={source.dimensions}
                  />
                  {/* Re-upload */}
                  <button
                    type="button"
                    onClick={() => {
                      handleReset();
                    }}
                    className="mt-3 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                  >
                    Change image
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

                    <TransparencyNotice
                      sourceHasAlpha={source.hasAlpha}
                      targetFormat={selectedFormat}
                    />

                    <FormatNotes format={selectedFormat} />

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
                      disabled={status === 'converting'}
                      className={`
                        flex items-center justify-center gap-2 w-full py-3 rounded-lg
                        font-mono font-semibold text-sm
                        ${status === 'converting'
                          ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                          : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-zinc-950 hover:opacity-90'}
                        disabled:opacity-60
                      `}
                    >
                      {status === 'converting' ? (
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

                {/* Converted preview */}
                {result && (
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
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-zinc-800/60 bg-zinc-950/80 h-10">
        <Footer />
      </footer>
      <Analytics />
    </div>
  );
}
