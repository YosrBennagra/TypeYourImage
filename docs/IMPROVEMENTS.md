# Improvement Suggestions

A prioritized list of improvements for AllYourTypes — grouped by category.

---

## UX / Interaction

### 1. Batch Conversion
Allow users to drop multiple files at once and convert them all to the same output format. Show a queue with individual progress bars and a "Download All (ZIP)" button at the end.

### 2. Recent Conversions History
Store the last 10 conversions in `localStorage` (metadata only — no blobs). Show a small "History" drawer in the sidebar so users can quickly redo common conversions without re-dropping the file.

### 3. Drag-to-Reorder Format Favorites
Let users pin their most-used output formats so they always appear first in the format selector. Persist with `localStorage`.

### 4. Before / After Comparison Slider
For image conversions, show an interactive slider comparing the original and converted images side by side. Helps users evaluate quality settings instantly.

### 5. Paste from Clipboard (Richer)
Extend `Ctrl+V` support beyond image blobs — paste base64 strings, raw JSON/CSV text, or URLs that auto-fetch and convert.

---

## Performance

### 6. Web Worker Offloading
Move Canvas-based image conversions into a dedicated Web Worker so the main thread never blocks during large-batch or high-resolution conversions.

### 7. Streaming FFmpeg Output
Use `SharedArrayBuffer` + multi-threaded FFmpeg core where available (requires `Cross-Origin-Isolation` headers). Fall back gracefully to the single-threaded core.

### 8. Lazy-Load Below-the-Fold Sections
Use `IntersectionObserver` to defer rendering of HowItWorks, SupportedFormats, and FaqSection until the user scrolls close. Reduces initial render cost.

### 9. Service Worker / PWA
Register a service worker to cache the app shell and FFmpeg WASM files. This makes repeat visits instant and enables true offline use.

---

## Features

### 10. PDF Support (Client-Side)
Use `pdf.js` for rendering PDFs to images and `jsPDF` for combining images into PDFs. Keeps conversions local.

### 11. SVG Optimizer
Integrate SVGO (compiled to WASM or via the npm package) to let users optimize SVGs while converting — useful for web developers.

### 12. Video Trimming / Cropping
Add a lightweight trim UI (start/end time scrubber) before conversion. Use FFmpeg's `-ss` / `-to` flags under the hood.

### 13. Audio Waveform Preview
Render a waveform visualization of audio files using the Web Audio API. Helps users verify the right file was uploaded and see clipping issues.

### 14. Metadata Viewer / Stripper
Show EXIF, IPTC, and XMP metadata for images. Offer a toggle to strip metadata during conversion for privacy.

---

## Design / Polish

### 15. Dark/Light Theme Toggle
Add a `prefers-color-scheme` aware toggle. The current "Warm Void" palette works well for dark mode; create a corresponding warm light palette with cream backgrounds and muted coral accents.

### 16. Skeleton Loading States
Replace the spinner with skeleton placeholders that match the layout shape of the content being loaded. Feels faster.

### 17. Micro-Interactions
Add subtle transitions: format cards scale slightly on hover, the convert button pulses once when enabled, progress bar has a shimmer overlay. Keep it understated — match the "not overwhelming" design philosophy.

### 18. Responsive Sidebar Collapse
On tablets (768–1024px), collapse the sidebar to icon-only mode with tooltips. Expand on hover or via a toggle.

---

## Developer Experience

### 19. Component Library Extraction
Extract UI primitives (Card, Button, Badge, Accordion) into a `src/ui/` folder with consistent prop APIs. Makes the codebase more maintainable.

### 20. E2E Tests
Add Playwright tests that: upload a PNG, convert to WebP, verify download. Cover at least image, audio, and data paths.

### 21. CI/CD Pipeline
GitHub Actions: lint → type-check → build → Playwright → deploy to Vercel preview on PR, production on `main` merge.

### 22. Bundle Analysis
Add `rollup-plugin-visualizer` to the Vite config and track bundle size in CI. Set a budget (e.g., < 350 KB gzipped).

---

## Accessibility

### 23. ARIA Live Regions
Announce conversion progress and completion to screen readers using `aria-live="polite"` regions.

### 24. Focus Management
After conversion completes, auto-focus the download button so keyboard users can download with a single Enter press.

### 25. Reduced Motion
Respect `prefers-reduced-motion: reduce` — disable all transitions and animations for users who need it.

---

*Last updated: auto-generated during layout redesign session.*
